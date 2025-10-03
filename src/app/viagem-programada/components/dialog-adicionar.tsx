"use client";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import { Veiculo, ViagemProgramda } from "@/lib/types";
import { Dialog, DialogTitle, DialogTrigger } from "@radix-ui/react-dialog";
import { Label } from "@radix-ui/react-label";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import loading from "../../assets/loading.svg";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function DialogAdicionar() {
  const queryClient = useQueryClient();
  const [viagem, setViagem] = useState<ViagemProgramda>({
    id: 0,
    titulo: "",
    descricao: "",
    saida: { data: "", hora: "", local: "" },
    retorno: { data: "", hora: "", local: "" },
    chegada: { data: "", hora: "", local: "" },
    valorPassagem: 0,
    formaPagto: "",
    responsavel: "",
    guia: "",
    itinerario: "",
    observacoes: "",
    veiculoId: 0,
    valorPassagemIdaVolta: 0,
    passagens: [],
    createdAt:""
  });



  const createViagemMutation = useMutation({
    mutationFn: async (viagemData: ViagemProgramda) => {
      const response = await api.post("/viagemprogramada", viagemData);
      if (!response.data.isSucces) {
        throw new Error(response.data.message);
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viagens-programadas"] });
      toast.success("Pacote adicionado com sucesso!");
      setViagem({
        id: 0,
        titulo: "",
        descricao: "",
        saida: { data: "", hora: "", local: "" },
        retorno: { data: "", hora: "", local: "" },
        chegada: { data: "", hora: "", local: "" },
        valorPassagem: 0,
        formaPagto: "",
        responsavel: "",
        guia: "",
        itinerario: "",
        observacoes: "",
        veiculoId: 0,
        valorPassagemIdaVolta: 0,
        passagens: [],
        createdAt: ""
      });
    },
    onError: () => {
      toast.error("Erro ao tentar adicionar pacote.");
    }
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      await createViagemMutation.mutateAsync(viagem);
    } catch {
      toast.error("Erro ao tentar adicionar pacote.");
    }
  }
const {data: veiculos = []} = useQuery({
  queryKey: ["veiculos"],
  queryFn: fetchVeiculos,
})
  async function fetchVeiculos() {
    const response = await api.get("/veiculo");

    if (!response.data.isSucces) {
      toast.error("erro ao tentar buscar veiculos, recarregue a pagina");
      return;
    }

    return response.data.data as Veiculo[];
  }

  useEffect(() => {
    fetchVeiculos();
  }, []);

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <span className="bg-green-600 hover:bg-green-500 px-10 py-2 rounded-md text-white transition-all">
            Adicionar Novo Pacote
          </span>
        </DialogTrigger>
        <DialogContent className="md:w-[90%] h-[600px] md:h-auto overflow-y-scroll md:overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-center font-semibold">
              Novo Pacote de Viagem
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="w-full">
            <fieldset className="border border-blue-800 rounded-md p-4 w-full">
              <legend>Informações da viagem</legend>
              <div className="flex flex-col md:flex-row gap-2">
                <div>
                  <Label htmlFor="titulo">Identificador</Label>
                  <Input
                    name="titulo"
                    placeholder="Identificador da viagem"
                    onChange={(e) =>
                      setViagem({ ...viagem, titulo: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    name="responsavel"
                    placeholder="Responsável"
                    onChange={(e) =>
                      setViagem({ ...viagem, responsavel: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="valorPassagem">Valor (Ida ou Volta)</Label>
                  <Input
                    name="valorPassagem"
                    type="number"
                    placeholder="00,00R$"
                    onChange={(e) =>
                      setViagem({
                        ...viagem,
                        valorPassagem: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="valorPassagem">Valor Ida e Volta</Label>
                  <Input
                    name="valorPassagem"
                    type="number"
                    placeholder="00,00R$"
                    onChange={(e) =>
                      setViagem({
                        ...viagem,
                        valorPassagemIdaVolta: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Forma de pagamento</Label>
                  <Select
                    onValueChange={(value) =>
                      setViagem({ ...viagem, formaPagto: value })
                    }
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="VISTA">À vista</SelectItem>
                        <SelectItem value="PRAZO">À prazo</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Veiculo</Label>
                  <Select
                    onValueChange={(value) =>
                      setViagem({ ...viagem, veiculoId: Number(value) })
                    }
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {veiculos.map((veiculo) => (
                          <SelectItem
                            key={veiculo.id}
                            value={veiculo.id.toString()}
                          >
                            {veiculo.prefixo} - {veiculo.placa.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-2">
                <fieldset className="border border-green-800 rounded-md p-4">
                  <legend>Origem</legend>
                  <div className="flex flex-col md:items-end md:h-full md:flex-row gap-2">
                    <div>
                      <Label htmlFor="dataSaida">Data de Saída</Label>
                      <Input
                        type="date"
                        onChange={(e) =>
                          setViagem({
                            ...viagem,
                            saida: { ...viagem.saida, data: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="horaSaida">Horário</Label>
                      <Input
                        type="time"
                        onChange={(e) =>
                          setViagem({
                            ...viagem,
                            saida: { ...viagem.saida, hora: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="localSaida">Local de Saída</Label>
                      <Input
                        placeholder="Local de saída"
                        onChange={(e) =>
                          setViagem({
                            ...viagem,
                            saida: { ...viagem.saida, local: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border border-green-800 rounded-md p-4">
                  <legend>Retorno</legend>
                  <div className="flex flex-col md:items-end md:flex-row gap-2">
                    <div>
                      <Label htmlFor="dataRetorno">Data de Retorno</Label>
                      <Input
                        name="dataRetorno"
                        type="date"
                        onChange={(e) =>
                          setViagem({
                            ...viagem,
                            retorno: {
                              ...viagem.retorno,
                              data: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="horaRetorno">Horário</Label>
                      <Input
                        type="time"
                        onChange={(e) =>
                          setViagem({
                            ...viagem,
                            retorno: {
                              ...viagem.retorno,
                              hora: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="localRetorno">Local de Retorno</Label>
                      <Input
                        placeholder="Local de retorno"
                        onChange={(e) =>
                          setViagem({
                            ...viagem,
                            retorno: {
                              ...viagem.retorno,
                              local: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border border-green-800 rounded-md p-4">
                  <legend>Chegada</legend>
                  <div className="flex flex-col md:items-end md:flex-row gap-2">
                    <div>
                      <Label htmlFor="dataChegada">Data de Chegada</Label>
                      <Input
                        name="dataChegada"
                        type="date"
                        onChange={(e) =>
                          setViagem({
                            ...viagem,
                            chegada: {
                              ...viagem.chegada,
                              data: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="horaChegada">Horário</Label>
                      <Input
                        type="time"
                        onChange={(e) =>
                          setViagem({
                            ...viagem,
                            chegada: {
                              ...viagem.chegada,
                              hora: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="localChegada">Local de Chegada</Label>
                      <Input
                        placeholder="Local de chegada"
                        onChange={(e) =>
                          setViagem({
                            ...viagem,
                            chegada: {
                              ...viagem.chegada,
                              local: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </fieldset>
              </div>

              <div className="flex flex-col md:flex-row gap-2 w-full">
                <div>
                  <Label htmlFor="itinerario">Itinerário</Label>
                  <Textarea
                    name="itinerario"
                    placeholder="Itinerário da viagem"
                    onChange={(e) =>
                      setViagem({ ...viagem, itinerario: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    name="descricao"
                    placeholder="Descrição da viagem"
                    onChange={(e) =>
                      setViagem({ ...viagem, descricao: e.target.value })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="observacao">Observacoes</Label>
                  <Textarea
                    name="observacao"
                    id="observacao"
                    placeholder="observacao da viagem"
                    onChange={(e) =>
                      setViagem({ ...viagem, observacoes: e.target.value })
                    }
                    className="w-full"
                  />
                </div>

                <Button type="submit" className="bg-green-600 mt-auto">
                  {createViagemMutation.isPending ? (
                    <Image
                      src={loading}
                      alt="loading"
                      className="text-center animate-spin"
                    />
                  ) : (
                    "Adicionar"
                  )}
                </Button>
              </div>
            </fieldset>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
