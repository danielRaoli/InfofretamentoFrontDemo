"use client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Bus, CalendarDays, TicketPercent } from "lucide-react";
import { DialogAdicionar } from "./components/dialog-adicionar";
import { useEffect, useState } from "react";
import { ViagemProgramda } from "@/lib/types";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { DialogEditar } from "./components/dialog-editar";
import { DialogInfo } from "./components/dialog-informacao";
import Link from "next/link";
import Image from "next/image";
import loading from "../assets/loading-dark.svg";
import { parseISO } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";
import axios from "axios";
import DialogRemover from "./components/dialog-remover";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ViagemProgramada() {
  const [ano, setAno] = useState<number | null>(null);
  const [mes, setMes] = useState<number | null>(null);
  const [pesquisarViagem, setPesquisarViagem] = useState("");
  

  const anos = Array.from({ length: 6 }, (_, i) => 2025 + i);
  const meses = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
  ];

  async function fetchViagens() {
    try {
      const params: Record<string, string> = {};
      if (ano) params["ano"] = ano.toString();
      if (mes) params["mes"] = mes.toString();
     
    
      // Construir a query string
      const queryString = new URLSearchParams(params).toString();
      
      const response = await api.get(`/viagemprogramada?${queryString}`);

      if (!response.data.isSucces) {
        toast("Erro ao tentar buscar viagens, recarregue a pagina");
        return [];
      }

      return response.data.data as ViagemProgramda[];

     
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast("Erro ao tentar buscar viagens, recarregue a pagina");
      }
      return [];
    }
  }

  const { data: viagemData = [], isLoading, refetch } = useQuery({
    queryKey: ["viagens-programadas", ano, mes],
    queryFn: fetchViagens,
  });

  useEffect(() => {
    refetch();
  }, [ano, mes, refetch]);

  const filtroViagens = viagemData
    .filter((viagem) => {
      if (!viagem.titulo) {
        return false;
      }
      return viagem.titulo.toLowerCase().includes(pesquisarViagem.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // descending order (most recent first)
    });

  return (
    <>
      <section className="bg-[#070180] pt-12 h-[1100px] md:h-[800px]">
        <div className="md:w-[1400px] w-[95%] h-[900px] md:h-[700px] mx-auto rounded-md bg-white flex flex-col overflow-y-scroll md:overflow-y-auto">
          <div className=" bg-black w-full">
            <p className="font-bold text-white text-center">
              Visualizar Viagens/Serviços
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0 justify-between p-4">
            <form className="flex gap-2 font-bold items-end">
              <div>
                <label htmlFor="pacote">Localizar Viagem:</label>
                <Input
                  name="pacote"
                  className="border-2 font-medium w-[250px]"
                  placeholder="Nome Pacote..."
                  value={pesquisarViagem}
                  onChange={(e) => setPesquisarViagem(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="ano">Ano:</label>
                <Select
                  onValueChange={(value) => {
                    setAno(value ? Number(value) : null);
                  }}
                  value={ano?.toString()}
                >
                  <SelectTrigger className="w-[130px] border-2">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {anos.map((ano) => (
                        <SelectItem key={ano} value={ano.toString()}>
                          {ano}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="mes">Mês:</label>
                <Select
                  onValueChange={(value) => {
                    setMes(value ? Number(value) : null);
                  }}
                  value={mes?.toString()}
                >
                  <SelectTrigger className="w-[130px] border-2">
                    <SelectValue placeholder="Selecione o mês" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {meses.map((mes) => (
                        <SelectItem key={mes.value} value={mes.value}>
                          {mes.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </form>
            <DialogAdicionar />
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center p-10">
              <Image
                src={loading}
                alt="loading"
                className="text-center animate-spin"
                width={50}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center md:flex-wrap md:flex-row justify-start gap-2 p-4">
              {filtroViagens.length > 0 ? (
                filtroViagens.map((viagem) => (
                  <Card className="p-4 w-[300px]" key={viagem.id}>
                    <CardTitle className="text-center font-bold text-xl mb-2">
                      {viagem.titulo}
                    </CardTitle>
                    <CardContent className="flex flex-col items-center w-full p-0 gap-2">
                      <div className="flex gap-1 items-center">
                        <Bus className="text-blue-800" />
                        <span>{viagem.itinerario.substring(0, 18)}</span>
                      </div>
                      <div className="flex flex-col gap-2 justify-start">
                        <div className="flex gap-1 items-center">
                          <CalendarDays className="text-green-600" />
                          <span>
                            {format(
                              toZonedTime(parseISO(viagem.saida.data), "UTC"),
                              "dd/MM/yyyy"
                            )}
                          </span>
                        </div>
                        <div className="flex gap-1 items-center">
                          <CalendarDays className="text-red-600" />
                          <span>
                            {format(
                              toZonedTime(parseISO(viagem.retorno.data), "UTC"),
                              "dd/MM/yyyy"
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 items-center">
                        <TicketPercent className="text-yellow-600" />
                        <span>IDA - R$ {viagem.valorPassagem}</span>
                        <span>Ida&Volta - R$ {viagem.valorPassagemIdaVolta}</span>
                      </div>
                      <div className="flex gap-2">
                        <DialogEditar
                          viagemEditavel={viagem}
                        />  
                        <DialogRemover
                          
                          viagemId={viagem.id}
                        />
                      </div>
                      <CardFooter className="p-0 flex flex-col">
                        <DialogInfo viagem={viagem} />
                        <Link
                          className="bg-slate-800 w-[170px] text-center text-sm text-white p-2 rounded-sm"
                          href={`/passagens?viagem=${viagem.id}`}
                        >
                          Registrar Passagem
                        </Link>
                      </CardFooter>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <span className="text-black font-semibold m-auto">
                  Nenhum Pacote De viagem Registrado
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
