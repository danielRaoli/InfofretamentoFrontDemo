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
import DialogAdicionar from "./components/dialog-adicionar";
import DialogEditar from "./components/dialog-editar";
import DialogExcluir from "./components/dialog_excluir";
import { useState } from "react";
import { Viagem } from "@/lib/types";
import { api } from "@/lib/axios";
//import ViagemPDF from "./components/dialog-document";
import { TravelDialog } from "./components/dialog-informacoes";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Image from "next/image";
import loading from "../assets/loading-dark.svg";
import { parseISO } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";
import { useQuery } from "@tanstack/react-query";

export default function ViagensServicos() {
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");
  const [veiculo, setVeiculo] = useState<string>("");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [selectedViagem, setSelectedViagem] = useState<Viagem | null>(null);
  const [dialogType, setDialogType] = useState<
    "edit" | "delete" | "details" | null
  >(null);
  const [shouldRefetch, setShouldRefetch] = useState(0); // Used to trigger manual refetches

  const formatNameMotorista = (motoristaNome: string) => {
    const arrayName = motoristaNome.split(" ");
    return arrayName[0];
  };

  async function fetchViagens() {
    // Construir os parâmetros da query
    const params: Record<string, string> = {};
    if (minDate) params["startDate"] = minDate;
    if (maxDate) params["endDate"] = maxDate;
    if (veiculo) params["prefixoVeiculo"] = veiculo;
  
    // Construir a query string
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/viagem?${queryString}` : "/viagem";
  
    const response = await api.get(url);
    if (!response.data.isSucces) {
      return [];
    }
    // Ordenar as viagens por data de criação (createdAt)
    const viagensOrdenadas = response.data.data.sort((a: Viagem, b: Viagem) => {
      const dateA = a.dataHorarioSaida.data ? new Date(a.dataHorarioSaida.data).getTime() : 0;
      const dateB = b.dataHorarioSaida.data ? new Date(b.dataHorarioSaida.data).getTime() : 0;
      return dateA - dateB ;
    });
  
    return (viagensOrdenadas as Viagem[]) ?? [];
  }
  

  const { data: viagemData, isLoading } = useQuery({
    queryKey: ["viagens", shouldRefetch], 
    queryFn: fetchViagens,
  });

  const filteredViagens =
    viagemData?.filter((viagem: Viagem) => {
      if (statusFiltro === "todos") return true;
      return viagem.status.toLocaleLowerCase() === statusFiltro;
    }) ?? [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShouldRefetch((prev) => prev + 1);
  };

  const handleOpenDialog = (
    viagem: Viagem,
    type: "edit" | "delete" | "details"
  ) => {
    setSelectedViagem(viagem);
    setDialogType(type);
  };

  const handleCloseDialog = () => {
    setSelectedViagem(null);
    setDialogType(null);
  };

  return (
    <section className="bg-[#070180] px-4 py-6 md:pt-12 md:h-[800px]">
      <div className="md:h-[700px] md:w-[1400px] mx-auto rounded-md bg-white flex flex-col overflow-y-scroll md:overflow-auto">
        <div className="bg-black w-full">
          <p className="font-bold text-white text-center">
            Visualizar Fretamentos
          </p>
        </div>
        <div className="flex items-center p-10">
          <div className="mx-auto md:w-full space-y-4">
            <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-between">
              <form
                onSubmit={handleSearch}
                className="flex flex-col md:items-end md:flex-row gap-2 font-bold"
              >
                <div>
                  <label htmlFor="fantasia">De:</label>
                  <Input
                    name="fantasia"
                    className="border-2 font-medium text-black md:w-min"
                    placeholder="Digite o identificador..."
                    onChange={(e) => setMinDate(e.target.value)}
                    type="date"
                    value={minDate}
                  />
                </div>
                <div className="">
                  <label htmlFor="fantasia">até:</label>
                  <Input
                    name="fantasia"
                    className="border-2 font-medium text-black md:w-min"
                    placeholder="Digite o identificador..."
                    type="date"
                    onChange={(e) => setMaxDate(e.target.value)}
                    value={maxDate}
                  />
                </div>
                <div>
                  <label htmlFor="cnpj">Veículo:</label>
                  <Input
                    name="cnpj"
                    className="border-2 font-medium text-black w-[250px]"
                    placeholder="Digite o prefixo..."
                    onChange={(e) => setVeiculo(e.target.value)}
                  />
                </div>
                <Button type="submit" className="bg-blue-600">
                  <Search className="text-white" />
                </Button>
                <div className="flex flex-col">
                  <label htmlFor="status">Status:</label>
                  <select
                    name="status"
                    className="border-2 font-medium w-[250px] p-2 rounded-md"
                    value={statusFiltro}
                    onChange={(e) => setStatusFiltro(e.target.value)}
                  >
                    <option value="todos">Todos</option>
                    <option value="pendente">Pendentes</option>
                    <option value="confirmado">Confirmados</option>
                  </select>
                </div>
              </form>

              <div className="flex items-center gap-2">
                <DialogAdicionar />
              </div>
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
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Data Saída
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Data Chegada
                      </TableHead>
                      <TableHead className="text-black font-bold text-center">
                        Motorista
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Veiculo
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Cliente
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Cidade Saída
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Cidade Destino
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Valor Contratado
                      </TableHead>
                      <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                        Status Viagem
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-center">
                    {filteredViagens.map((viagemData: Viagem) => (
                      <TableRow
                        className="hover:bg-gray-200"
                        key={viagemData.id}
                      >
                        <TableCell
                          className={`hidden sm:table-cell ${
                            viagemData.status !== "CONFIRMADO" &&
                            new Date(viagemData.dataHorarioSaida.data) <
                              new Date()
                              ? "text-red-500 font-bold"
                              : "text-black"
                          }`}
                        >
                          {format(
                            toZonedTime(
                              parseISO(viagemData.dataHorarioSaida.data),
                              "UTC"
                            ),
                            "dd/MM/yyyy"
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {format(
                            toZonedTime(
                              parseISO(viagemData.dataHorarioRetorno.data),
                              "UTC"
                            ),
                            "dd/MM/yyyy"
                          )}
                        </TableCell>
                        <TableCell>
                          {viagemData.motoristaViagens &&
                          viagemData.motoristaViagens.length > 0 &&
                          viagemData.motoristaViagens[0].motorista
                            ? formatNameMotorista(
                                viagemData.motoristaViagens[0].motorista.nome
                              )
                            : "Sem motorista"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {viagemData.veiculo?.prefixo}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {viagemData.cliente?.nomeFantasia.substring(0, 15)}...
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {viagemData.rota.saida.cidadeSaida}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {viagemData.rota.retorno.cidadeSaida}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {viagemData.valorContratado}
                        </TableCell>
                        <TableCell
                          className={`hidden sm:table-cell ${
                            viagemData.status !== "CONFIRMADO"
                              ? "text-red-500 font-bold"
                              : "text-black"
                          }`}
                        >
                          {viagemData.status}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/*<ViagemPDF dadosViagens={viagemData} />} */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleOpenDialog(viagemData, "edit")
                              }
                            >
                              <Image
                                src={editIcon}
                                alt="Editar"
                                width={25}
                                className="w-6"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleOpenDialog(viagemData, "delete")
                              }
                            >
                              <Image
                                src={removeIcon}
                                alt="Remover"
                                className="w-10 md:w-6"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleOpenDialog(viagemData, "details")
                              }
                            >
                              <Image
                                src={detalhesIcon}
                                alt="Remover"
                                className="w-10 md:w-6"
                              />
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
      {selectedViagem && dialogType === "edit" && (
        <DialogEditar viagem={selectedViagem} onClose={handleCloseDialog} />
      )}

      {selectedViagem && dialogType === "delete" && (
        <DialogExcluir id={selectedViagem.id} onClose={handleCloseDialog} />
      )}

      {selectedViagem && dialogType === "details" && (
        <TravelDialog
          viagemId={selectedViagem.id}
          onClose={handleCloseDialog}
        />
      )}
    </section>
  );
}