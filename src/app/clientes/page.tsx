"use client";
import FormInput from "@/components/form-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DialogAdicionar from "./components/dialog-adicionar";
import DialogEditar from "./components/dialog-editar";
import DialogInformacoes from "./components/dialog-informacoes";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import DialogExcluir from "./components/dialogExcluir";
import { Cliente } from "@/lib/types";
import loading from "../assets/loading-dark.svg";
import Image from "next/image";

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [buscarCliente, setBuscarCliente] = useState<string | "">("");

  async function fetchClientes() {
    setCarregando(true);
    try {
      const response = await api.get("/cliente");
      setClientes(response.data.data);
    } catch (error) {
      console.log("Erro ao tentar recuperar clientes.", error);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    fetchClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    if (!cliente) return false;
    return cliente.nomeFantasia.toLowerCase().includes(buscarCliente.toLowerCase());
  });

  return (
    <section className="bg-[#070180] px-4 py-6 md:pt-12 md:h-[800px]">
      <div className="h-[700px] md:w-[1400px] mx-auto rounded-md bg-white flex flex-col">
        <div className=" bg-black w-full">
          <p className="font-bold text-white text-center">
            Visualizar Clientes
          </p>
        </div>
        <div className="flex items-center p-10">
          <div className=" mx-auto md:w-full space-y-4">
            <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-between">
              <form className="flex flex-col gap-2 font-bold">
                <FormInput
                  label="Nome Cliente..."
                  name="nomecliente"
                  placeholder="Digite o nome..."
                  value={buscarCliente}
                  onChange={(e) => setBuscarCliente(e.target.value)}
                />
              </form>
              <DialogAdicionar clientes={clientes} setClientes={setClientes} />
            </div>
            {carregando ? (
              <div className="flex items-center justify-center">
                <Image
                  src={loading}
                  alt="carregando"
                  className="text-center animate-spin"
                  width={50}
                />
              </div>
            ) : (
              <div className="h-[450px] md:h-[500px] overflow-y-scroll scrollbar-hide">
                <Table>
                  <TableHeader className="border-b-2">
                    <TableRow>
                      <TableHead className="text-black font-bold text-center">
                        Nome Completo
                      </TableHead>
                      <TableHead className="text-black font-bold text-center">
                        Nome Fantasia
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        CPF
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Cidade
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Telefone
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Tipo Cliente
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Documento
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-center">
                    {clientesFiltrados.map((cliente) => (
                      <TableRow className="hover:bg-gray-200" key={cliente.id}>
                        <TableCell>{cliente.nome.substring(0, 15)}...</TableCell>
                        <TableCell>{cliente.nomeFantasia.substring(0, 15)}...</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {cliente.cpf}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {cliente.endereco.cidade}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{cliente.telefone}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {cliente.documento.documento}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DialogEditar
                              cliente={cliente}
                              setClientes={setClientes}
                              clientes={clientes}
                            />
                            <DialogExcluir
                              cliente={cliente}
                              clienteName={cliente.nome}
                              setClientes={setClientes}
                            />
                            <DialogInformacoes cliente={cliente} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
