import Image from "next/image";
import logo from "@/app/assets/Logo-MarceloTurismoBranco.png";
import porta from "@/app/assets/porta.png";
import logoBrothers from "@/app/assets/logo-bc.png";

export default function Footer() {
  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <footer className="flex flex-col items-center justify-between px-10 bg-[#070180]">
      <div className="flex items-center justify-around w-full">
        <Image
          src={logo}
          alt="Logomarca Marcelo Turismo"
          className="w-[250px] md:w-[300px]"
        />
        <div className="flex flex-col items-center gap-1 cursor-pointer">
          <button onClick={logout}>
            <Image src={porta} alt="Porta" width={60} />
            <p className="text-white">Sair</p>
          </button>
        </div>
      </div>

      <div className="bg-black w-[555px] md:w-[1519px]">
        <div className="flex justify-center items-center gap-2">
          <p className="text-white"> Desenvolvido por Brothers Company </p>
          <Image
            src={logoBrothers}
            alt="Logo Brothers Company"
            className="w-5"
          />
        </div>
      </div>
    </footer>
  );
}
