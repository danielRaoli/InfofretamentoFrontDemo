import axios from "axios";
import {jwtDecode, JwtPayload} from "jwt-decode"

export const api = axios.create({
baseURL: "https://evolution-fretamento.wtw36t.easypanel.host",
  withCredentials: true,
});

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: JwtPayload = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000); // Tempo atual em segundos
    return decoded.exp ? decoded.exp < currentTime : true;
  } catch {
    return true; // Se não conseguir decodificar, considera expirado
  }
};

// Interceptor de requisição (antes de enviar)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Pegue o token de onde você armazena

  if (token) {
    if (isTokenExpired(token)) {
      localStorage.removeItem("token"); // Remove token expirado
      window.location.href = "/login"; // Redireciona para login
      return Promise.reject(new Error("Token expirado"));
    }

    config.headers.Authorization = `Bearer ${token}`; // Adiciona o token válido
  }

  return config;
});

// Interceptor de resposta (caso receba 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token"); // Remove o token inválido
      window.location.href = "/login"; // Redireciona para login
    }
    return Promise.reject(error);
  }
);

export default api;