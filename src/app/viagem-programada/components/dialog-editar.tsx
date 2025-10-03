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
import { useState } from "react";
import { toast } from "sonner";
import loading from "../../assets/loading.svg";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";


interface EditProps {
  viagemEditavel: ViagemProgramda;
}

export function DialogEditar({
  viagemEditavel
}: EditProps) {
  const [viagem, setViagemEditavel] = useState<ViagemProgramda>(viagemEditavel);

  const queryClient = useQueryClient();

  const updateViagemMutation = useMutation({
    mutationFn: async (viagemData: ViagemProgramda) => {
      const response = await api.put(`/viagemprogramada/${viagem.id}`, viagemData);
      if (!response.data.isSucces) {
        toast.error(response.data.message)
          return
      }
      queryClient.invalidateQueries({ queryKey: ["viagens-programadas"] });
      toast.success("Editada com sucesso")
      return response.data.data;
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  
    try {
      
      updateViagemMutation.mutateAsync(viagem)
   
    } catch  {
      toast.error("Erro ao tentar editar viagem");
    } 
  }

  const { data: veiculos = [] } = useQuery({
    queryKey: ["veiculos"],
    queryFn: fetchVeiculos,
  });

  async function fetchVeiculos() {
    const response = await api.get("/veiculo");

    if (!response.data.isSucces) {
      toast("erro ao tentar buscar veiculos, recarregue a pagina");
      return;
    }

    return response.data.data as Veiculo[];
  }


  return (
    <>
      <Dialog>
        <DialogTrigger>
          <span className="bg-blue-800 hover:bg-blue-600 px-5 py-2 text-white text-center rounded-md transition-all">Editar</span>
        </DialogTrigger>
        <DialogContent className="w-[90%] h-[600px] md:h-auto overflow-y-scroll md:overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-center font-semibold">
              Editar Pacote de Viagem
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
                    defaultValue={viagem.titulo}
                    onChange={(e) =>
                      setViagemEditavel({ ...viagem, titulo: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    name="responsavel"
                    placeholder="Responsável"
                    defaultValue={viagem.responsavel}
                    onChange={(e) =>
                      setViagemEditavel({
                        ...viagem,
                        responsavel: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="valorPassagem">Valor Ida</Label>
                  <Input
                    name="valorPassagem"
                    defaultValue={viagem.valorPassagem}
                    type="number"
                    placeholder="00,00R$"
                    onChange={(e) =>
                      setViagemEditavel({
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
                    defaultValue={viagem.valorPassagemIdaVolta}
                    type="number"
                    placeholder="00,00R$"
                    onChange={(e) =>
                      setViagemEditavel({
                        ...viagem,
                        valorPassagemIdaVolta: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Forma de pagamento</Label>
                  <Select
                    defaultValue={viagem.formaPagto}
                    onValueChange={(value) =>
                      setViagemEditavel({ ...viagem, formaPagto: value })
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
                    defaultValue={viagem.veiculoId.toString()}
                    onValueChange={(value) =>
                      setViagemEditavel({ ...viagem, veiculoId: Number(value) })
                    }
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {veiculos.map((veiculo) => (
                          <SelectItem
                            key={veiculo.id}
                            value={veiculo.id.toString()}
                          >
                            {veiculo.prefixo} - {veiculo.placa}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <fieldset className="border border-green-800 rounded-md p-4">
                  <legend>Saída</legend>
                  <div className="flex flex-col md:flex-row gap-2">
                    <div>
                      <Label htmlFor="dataSaida">Data de Saída</Label>
                      <Input
                        type="date"
                        defaultValue={viagem.saida.data}
                        onChange={(e) =>
                          setViagemEditavel({
                            ...viagem,
                            saida: { ...viagem.saida, data: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="horaSaida">Horário</Label>
                      <Input
                        defaultValue={viagem.saida.hora}
                        type="time"
                        onChange={(e) =>
                          setViagemEditavel({
                            ...viagem,
                            saida: { ...viagem.saida, hora: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="localSaida">Local de Saída</Label>
                      <Input
                        defaultValue={viagem.saida.local}
                        placeholder="Local de saída"
                        onChange={(e) =>
                          setViagemEditavel({
                            ...viagem,
                            saida: { ...viagem.saida, local: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border border-green-800 rounded-md p-4">
                  <legend>Destino</legend>
                  <div className="flex flex-col md:flex-row gap-2">
                    <div>
                      <Label htmlFor="dataRetorno">Data de chegada</Label>
                      <Input
                        defaultValue={viagem.retorno.data}
                        type="date"
                        onChange={(e) =>
                          setViagemEditavel({
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
                        defaultValue={viagem.retorno.hora}
                        type="time"
                        onChange={(e) =>
                          setViagemEditavel({
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
                      <Label htmlFor="localRetorno">Local do Destino</Label>
                      <Input
                        placeholder="Local do destino"
                        defaultValue={viagem.retorno.local}
                        onChange={(e) =>
                          setViagemEditavel({
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
                  <div className="flex flex-col md:flex-row gap-2">
                    <div>
                      <Label htmlFor="dataChegada">Data de Chegada</Label>

                      <Input
                        defaultValue={viagem.chegada.data}
                        type="date"
                        onChange={(e) =>
                          setViagemEditavel({
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
                        defaultValue={viagem.chegada.hora}
                        type="time"
                        onChange={(e) =>
                          setViagemEditavel({
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
                        defaultValue={viagem.chegada.local}
                        placeholder="Local de chegada"
                        onChange={(e) =>
                          setViagemEditavel({
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
                    defaultValue={viagem.itinerario}
                    placeholder="Itinerário da viagem"
                    onChange={(e) =>
                      setViagemEditavel({
                        ...viagem,
                        itinerario: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    name="descricao"
                    defaultValue={viagem.descricao}
                    placeholder="Descrição da viagem"
                    onChange={(e) =>
                      setViagemEditavel({
                        ...viagem,
                        descricao: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="observacao">Observacoes</Label>
                  <Textarea
                    name="observacao"
                    defaultValue={viagem.observacoes}
                    id="observacao"
                    placeholder="observacao da viagem"
                    onChange={(e) =>
                      setViagemEditavel({
                        ...viagem,
                        observacoes: e.target.value,
                      })
                    }
                    className="w-full"
                  />
                </div>

                <Button type="submit" className="bg-green-600 mt-auto">
                  {updateViagemMutation.isPending ? (
                    <Image
                      src={loading}
                      alt="loading"
                      className="text-center animate-spin"
                    />
                  ) : (
                    "Atualizar"
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
