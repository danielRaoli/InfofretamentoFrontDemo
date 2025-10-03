"use client";
import { Input } from "@/components/ui/input";
import editIcon from "../assets/edit.svg";
import removeIcon from "../assets/remove.svg";
import detalhesIcon from "../assets/dadosviagem.svg";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image";
import loading from "../assets/loading-dark.svg";
import { useQuery } from "@tanstack/react-query";

import  {DialogEditarMotorista}  from "./components/dialog-editar";
import { DialogExcluirMotorista } from "./components/dialog-excluir";
import { DialogInformacoesMotorista } from "./components/dialog-informacoes";
import { Motorista } from "@/lib/types";


export default function Motoristas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMotorista, setSelectedMotorista] = useState<Motorista | null>(null);
  const [dialogType, setDialogType] = useState<'edit' | 'delete' | 'details' | null>(null);

  const { data: motoristas, isLoading } = useQuery({
    queryKey: ["motoristas"],
    queryFn: async () => {
      const response = await api.get("/motorista");
      if (!response.data.isSucces) {
        throw new Error("Erro ao buscar motoristas");
      }
      return response.data.data as Motorista[];
    }
  });



  const filteredMotoristas = motoristas?.filter(motorista => 
    motorista.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    motorista.cpf.includes(searchTerm) ||
    motorista.habilitacao.protocolo.includes(searchTerm)
  ) ?? [];

  const handleOpenDialog = (motorista: Motorista, type: 'edit' | 'delete' | 'details') => {
    setSelectedMotorista(motorista);
    setDialogType(type);
  };

  const handleCloseDialog = () => {
    setSelectedMotorista(null);
    setDialogType(null);
  };

  return (
    <section className="bg-[#070180] px-4 py-6 md:pt-12 md:h-[800px]">
      <div className="md:h-[700px] md:w-[1400px] mx-auto rounded-md bg-white flex flex-col overflow-y-scroll md:overflow-auto">
        <div className="bg-black w-full">
          <p className="font-bold text-white text-center">
            Visualizar Motoristas
          </p>
        </div>
        <div className="flex items-center p-10">
          <div className="mx-auto md:w-full space-y-4">
            <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-between">
              <form className="flex flex-col md:items-end md:flex-row gap-2 font-bold">
                <div>
                  <label htmlFor="search">Buscar:</label>
                  <Input
                    id="search"
                    name="search"
                    className="border-2 font-medium text-black w-[250px]"
                    placeholder="Nome, CPF ou CNH..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="button" className="bg-blue-600">
                  <Search className="text-white" />
                </Button>
              </form>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-10">
                <Image
                  src={loading}
                  alt="loading"
                  className="text-center animate-spin"
                  width={50}
                  height={50}
                />
              </div>
            ) : (
              <div className="h-[500px] overflow-y-scroll scrollbar-hide">
                <Table>
                  <TableHeader className="border-b-2">
                    <TableRow>
                      <TableHead className="text-black font-bold text-center">Nome</TableHead>
                      <TableHead className="text-black font-bold text-center">CPF</TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">Cidade</TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">Telefone</TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">CNH</TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-center">
                    {filteredMotoristas.map((motorista) => (
                      <TableRow key={motorista.id}>
                        <TableCell>{motorista.nome}</TableCell>
                        <TableCell>{motorista.cpf}</TableCell>
                        <TableCell className="hidden sm:table-cell">{motorista.endereco.cidade}</TableCell>
                        <TableCell className="hidden sm:table-cell">{motorista.telefone}</TableCell>
                        <TableCell className="hidden sm:table-cell">{motorista.habilitacao.protocolo}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-center">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenDialog(motorista, 'edit')}
                            >
                              <Image src={editIcon} alt="Editar" width={25} className="w-6" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenDialog(motorista, 'delete')}
                            >
                              <Image src={removeIcon} alt="Remover" className="w-10 md:w-6" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleOpenDialog(motorista, 'details')}
                            >
                              <Image src={detalhesIcon} alt="Detalhes" className="w-10 md:w-6" />
                            </Button>
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

      {/* Dialogs */}
      {selectedMotorista && dialogType === 'edit' && (
        <DialogEditarMotorista
          motorista={selectedMotorista}
          onClose={handleCloseDialog}
        />
      )}
      {selectedMotorista && dialogType === 'delete' && (
        <DialogExcluirMotorista
          id={selectedMotorista.id}
          onClose={handleCloseDialog}
        />
      )}
      
      {selectedMotorista && dialogType === 'details' && (
        <DialogInformacoesMotorista 
          motoristaId={selectedMotorista.id}
          onClose={handleCloseDialog}
        />
      )}
    </section>
  );
}
