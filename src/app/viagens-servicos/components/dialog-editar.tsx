"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Cidade, Motorista, Uf, Veiculo, Viagem } from "@/lib/types";
import { api } from "@/lib/axios";
import { useState } from "react";
import { toast } from "sonner";
import loading from "../../assets/loading.svg";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomCitySelect } from "@/components/custom-city-selector";

interface EditarProps {
  viagem: Viagem;
  onClose: () => void;
}

async function fetchUfs() {
  const response = await axios.get<Uf[]>(
    "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
  );
  return response.data.sort((a, b) => a.nome.localeCompare(b.nome));
}

async function fetchCidades(uf: string) {
  const response = await axios.get<Cidade[]>(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
  );
  return response.data.sort((a, b) => a.nome.localeCompare(b.nome));
}

async function fetchMotoristas() {
  const response = await api.get("/motorista");
  return response.data.data as Motorista[];
}

async function fetchVeiculos() {
  const response = await api.get("/veiculo");
  return response.data.data as Veiculo[];
}

interface ViagemRequest {
  rota: {
    saida: {
      ufSaida: string;
      cidadeSaida: string;
      localDeSaida: string;
    };
    retorno: {
      ufSaida: string;
      cidadeSaida: string;
      localDeSaida: string;
    };
  };
  veiculoId: number;
  motoristasId: number[];
  dataHorarioSaida: {
    data: string;
    hora: string;
  };
  dataHorarioRetorno: {
    data: string;
    hora: string;
  };
  dataHorarioSaidaGaragem: {
    data: string;
    hora: string;
  };
  dataHorarioChegada: {
    data: string;
    hora: string;
  };
  tipoServico: string;
  itinerario: string;
  status: string;
  kmInicialVeiculo: number;
  kmFinalVeiculo: number;
  valorParcial: number;
  valorContratado: number;
  clienteId: number;
  tipoViagem: string;
  tipoPagamento: string;
}

export default function DialogEditar({ viagem, onClose }: EditarProps) {
  const [open, setOpen] = useState(true);
  const [viagemState, setViagem] = useState<Viagem>(viagem);
  const [valorParcial, setValorParcial] = useState<number>(0);
  const queryClient = useQueryClient();

  const { data: ufs = [] } = useQuery({
    queryKey: ["ufs"],
    queryFn: fetchUfs,
  });

  const { data: cidadesSaida = [] } = useQuery({
    queryKey: ["cidades-saida", viagemState.rota.saida.ufSaida],
    queryFn: () => fetchCidades(viagemState.rota.saida.ufSaida),
    enabled: !!viagemState.rota.saida.ufSaida,
  });

  const { data: cidadesVolta = [] } = useQuery({
    queryKey: ["cidades-volta", viagemState.rota.retorno.ufSaida],
    queryFn: () => fetchCidades(viagemState.rota.retorno.ufSaida),
    enabled: !!viagemState.rota.retorno.ufSaida,
  });

  const { data: motoristas = [] } = useQuery({
    queryKey: ["motoristas"],
    queryFn: fetchMotoristas,
  });

  const { data: veiculos = [] } = useQuery({
    queryKey: ["veiculos"],
    queryFn: fetchVeiculos,
  });

  const { mutate, isPending } = useMutation<Viagem, Error, ViagemRequest>({
    mutationFn: async (request) => {
      const response = await api.put(`/viagem/${viagem.id}`, request);
      return response.data.data as Viagem;
    },
    onSuccess: () => {
      toast.success("Viagem atualizada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["viagens"] });
      handleClose();
    },
    onError: () => {
      toast.error("Erro ao tentar atualizar viagem");
    },
  });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleUfSaidaChange = (uf: string) => {
    setViagem({
      ...viagemState,
      rota: {
        ...viagemState.rota,
        saida: { ...viagemState.rota.saida, ufSaida: uf },
      },
    });
  };

  const handleUfDestinoChange = (uf: string) => {
    setViagem({
      ...viagemState,
      rota: {
        ...viagemState.rota,
        retorno: { ...viagemState.rota.retorno, ufSaida: uf },
      },
    });
  };

  function selecionarVeiculo(id: number) {
    const veiculoSelecionado = veiculos.find((v) => Number(v.id) === id);
    setViagem((prevViagem) => ({
      ...prevViagem,
      veiculoId: id,
      veiculo: veiculoSelecionado,
      kmInicialVeiculo: Number(veiculoSelecionado?.kmAtual),
    }));
  }

  function selecionarMotorista(id: number, motorista: number) {
    if (motorista === 1) {
      setViagem({
        ...viagemState,
        motoristaViagens: [{ motoristaId: id, viagemId: viagemState.id }],
      });
    } else if (motorista === 2) {
      if (id === viagemState.motoristaViagens[0].motoristaId) {
        toast.error("Motorista já selecionado");
        return;
      }
      setViagem((prevViagem) => ({
        ...prevViagem,
        motoristaViagens: [
          ...prevViagem.motoristaViagens,
          { motoristaId: id, viagemId: viagemState.id },
        ],
      }));
    }
  }

  const servicos = [
    { nome: "Turismo", valor: "TURISMO" },
    { nome: "Escolar", valor: "ESCOLAR" },
    { nome: "Especial", valor: "ESPECIAL" },
    { nome: "Fretamento", valor: "FRETAMENTO" },
    { nome: "Translado", valor: "TRANSLADO" },
    { nome: "Turismo Religioso", valor: "TURISMO_RELIGIOSO" },
    { nome: "Trans Funcionarios", valor: "TRANS_FUNCIONARIOS" },
  ];

  const tipo_viagem = [
    "INTERMUNICIPAL",
    "MUNICIPAL",
    "INTERESTADUAL",
    "INTERNACIONAL",
  ];

  const status_viagem = [
    { nome: "Pendente", valor: "PENDENTE" },
    { nome: "Confirmado", valor: "CONFIRMADO" },
    { nome: "Finalizado", valor: "FINALIZADO" },
    { nome: "Cancelado", valor: "CANCELADO" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-[1200px] w-[90vw] md:h-[700px] max-h-[90vh] rounded-md flex flex-col items-center overflow-scroll">
        <DialogHeader className="mb-5">
          <DialogTitle className="font-black">
            Edição de Viagem/Serviço
          </DialogTitle>
        </DialogHeader>
        <form
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            if (viagemState.motoristaViagens.length === 0) {
              toast("Selecione um motorista novamente");
              return;
            }

            const requestData: ViagemRequest = {
              rota: {
                saida: {
                  ufSaida: viagemState.rota.saida.ufSaida,
                  cidadeSaida: viagemState.rota.saida.cidadeSaida,
                  localDeSaida: viagemState.rota.saida.localDeSaida,
                },
                retorno: {
                  ufSaida: viagemState.rota.retorno.ufSaida,
                  cidadeSaida: viagemState.rota.retorno.cidadeSaida,
                  localDeSaida: viagemState.rota.retorno.localDeSaida,
                },
              },
              veiculoId: viagemState.veiculoId,
              motoristasId: viagemState.motoristaViagens.map(
                (mv) => mv.motoristaId
              ),
              dataHorarioSaida: {
                data: viagemState.dataHorarioSaida.data,
                hora: viagemState.dataHorarioSaida.hora,
              },
              dataHorarioRetorno: {
                data: viagemState.dataHorarioRetorno.data,
                hora: viagemState.dataHorarioRetorno.hora,
              },
              dataHorarioSaidaGaragem: {
                data: viagemState.dataHorarioSaidaGaragem.data,
                hora: viagemState.dataHorarioSaidaGaragem.hora,
              },
              dataHorarioChegada: {
                data: viagemState.dataHorarioChegada.data,
                hora: viagemState.dataHorarioChegada.hora,
              },
              tipoServico: viagemState.tipoServico,
              itinerario: viagemState.itinerario,
              status: viagemState.status,
              kmInicialVeiculo: viagemState.kmInicialVeiculo,
              kmFinalVeiculo: viagemState.kmFinalVeiculo,
              valorParcial: valorParcial,
              valorContratado: viagemState.valorContratado,
              clienteId: viagemState.clienteId,
              tipoViagem: viagemState.tipoViagem,
              tipoPagamento: viagemState.tipoPagamento,
            };

            mutate(requestData);
          }}
        >
          <div className="flex flex-col h-full overflow-y-scroll md:overflow-auto">
            <div className="w-full flex flex-col md:flex-row md:h-[200px] justify-evenly gap-4">
              <fieldset className="border h-[200px] border-blue-900 rounded-md p-4 flex-1 flex-col md:flex-row flex gap-2">
                <legend>Cliente</legend>
                <div className="flex-1">
                  <Label htmlFor="cliente">Cliente</Label>
                  <Select
                    value={viagem.clienteId.toString()}
                    name="cliente"
                    disabled
                  >
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={viagem.clienteId.toString()}>
                          {viagem.cliente?.nome}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="telefone">Telefone Cliente</Label>
                  <Input
                    name="telefone"
                    value={viagem.cliente?.telefone}
                    placeholder="(xx) x xxxx-xxxx"
                    type="tel"
                    id="telefone"
                    disabled
                  />
                </div>
              </fieldset>
              <fieldset className="border border-blue-900 flex-1 flex-col md:flex-row rounded-md p-4 flex gap-2">
                <legend>Servico</legend>
                <div className="flex-1">
                  <Label htmlFor="tiposervico">Tipo do Servico</Label>
                  <Select
                    value={viagemState.tipoServico}
                    onValueChange={(e) =>
                      setViagem({ ...viagemState, tipoServico: e })
                    }
                    name="tiposervico"
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {servicos.map((servico) => (
                          <SelectItem key={servico.nome} value={servico.valor}>
                            {servico.nome}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="tiposervico">Tipo da viagem</Label>
                  <Select
                    value={viagemState.tipoViagem}
                    onValueChange={(e) =>
                      setViagem({ ...viagemState, tipoViagem: e })
                    }
                    disabled={viagemState.status === "CONFIRMADO"}
                    name="tiposervico"
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {tipo_viagem.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="pagamento">Tipo do Pagamento</Label>
                  <Select
                    value={viagemState.tipoPagamento}
                    onValueChange={(e) =>
                      setViagem({ ...viagemState, tipoPagamento: e })
                    }
                    name="pagamento"
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Selecione o tipo..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="PRAZO">A prazo</SelectItem>
                        <SelectItem value="VISTA">A vista</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 w-[100px]">
                  <Label htmlFor="valor">Valor</Label>
                  <Input
                    value={viagemState.valorContratado}
                    name="valor"
                    onChange={(e) =>
                      setViagem({
                        ...viagemState,
                        valorContratado: Number(e.target.value),
                      })
                    }
                    placeholder="0,00R$"
                    type="number"
                  />
                </div>
              </fieldset>
            </div>
            <div className="w-full flex flex-col md:flex-row gap-2 mt-2">
              <div className="flex flex-col flex-1">
                <div className="w-full">
                  <fieldset className="border-2 border-green-600 rounded-md justify-between p-4 flex flex-col md:flex-row gap-2">
                    <legend>Local Inicial / Origem / Destino</legend>
                    <div className="flex flex-col md:flex-row gap-2">
                      <div>
                        <Label htmlFor="ufsaida">UF Saida</Label>
                        <Select
                          value={viagemState.rota.saida.ufSaida}
                          onValueChange={handleUfSaidaChange}
                          name="ufsaida"
                        >
                          <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Uf" />
                          </SelectTrigger>
                          <SelectContent className="absolute max-h-[200px]">
                            <SelectGroup>
                              {ufs.map((uf) => (
                                <SelectItem key={uf.sigla} value={uf.sigla}>
                                  {uf.sigla}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="origem">Origem</Label>
                        <CustomCitySelect
                          cities={cidadesSaida}
                          value={viagemState.rota.saida.cidadeSaida}
                          onSelect={(cityName) =>
                            setViagem({
                              ...viagemState,
                              rota: {
                                ...viagemState.rota,
                                saida: {
                                  ...viagemState.rota.saida,
                                  cidadeSaida: cityName,
                                },
                              },
                            })
                          }
                          placeholder="Busque uma cidade..."
                          disabled={!viagemState.rota.saida.ufSaida}
                        />
                      </div>
                      <div>
                        <Label htmlFor="localsaida">Local saida</Label>
                        <Input
                          value={viagemState.rota.saida.localDeSaida}
                          onChange={(e) =>
                            setViagem({
                              ...viagemState,
                              rota: {
                                ...viagemState.rota,
                                saida: {
                                  ...viagemState.rota.saida,
                                  localDeSaida: e.target.value,
                                },
                              },
                            })
                          }
                          name="localsaida"
                          type="text"
                          placeholder="digite o local de saída"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date">Data saida</Label>
                        <Input
                          value={viagemState.dataHorarioSaida.data}
                          name="date"
                          type="date"
                          onChange={(e) =>
                            setViagem({
                              ...viagemState,
                              dataHorarioSaida: {
                                ...viagemState.dataHorarioSaida,
                                data: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="horariosaida">Horario </Label>
                        <Input
                          value={viagemState.dataHorarioSaida.hora}
                          name="horariosaida"
                          onChange={(e) =>
                            setViagem({
                              ...viagemState,
                              dataHorarioSaida: {
                                ...viagemState.dataHorarioSaida,
                                hora: e.target.value,
                              },
                            })
                          }
                          type="time"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <Label htmlFor="saidagaragem">Saida Garagem</Label>
                        <Input
                          value={viagemState.dataHorarioSaidaGaragem.data}
                          name="saidagaragem"
                          type="date"
                          onChange={(e) =>
                            setViagem({
                              ...viagemState,
                              dataHorarioSaidaGaragem: {
                                ...viagemState.dataHorarioSaidaGaragem,
                                data: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="horasaida">Hora Saida</Label>
                        <Input
                          value={viagemState.dataHorarioSaidaGaragem.hora}
                          name="horasaida"
                          type="time"
                          onChange={(e) =>
                            setViagem({
                              ...viagemState,
                              dataHorarioSaidaGaragem: {
                                ...viagemState.dataHorarioSaidaGaragem,
                                hora: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </fieldset>
                </div>
                <div className="w-full">
                  <fieldset className="border-2 border-red-600 rounded-md justify-between p-4 flex flex-col md:flex-row gap-2">
                    <legend>Local Final / Destino / Retorno</legend>

                    <div className="flex flex-col md:flex-row gap-2">
                      <div>
                        <Label htmlFor="ufdestino">UF Destino</Label>
                        <Select
                          value={viagemState.rota.retorno.ufSaida}
                          onValueChange={handleUfDestinoChange}
                          name="ufdestino"
                        >
                          <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Uf" />
                          </SelectTrigger>
                          <SelectContent className="absolute max-h-[200px]">
                            <SelectGroup>
                              {ufs.map((uf) => (
                                <SelectItem key={uf.sigla} value={uf.sigla}>
                                  {uf.sigla}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="destino">Destino</Label>
                        <CustomCitySelect
                          cities={cidadesVolta}
                          value={viagemState.rota.retorno.cidadeSaida}
                          onSelect={(cityName) =>
                            setViagem({
                              ...viagemState,
                              rota: {
                                ...viagemState.rota,
                                retorno: {
                                  ...viagemState.rota.retorno,
                                  cidadeSaida: cityName,
                                },
                              },
                            })
                          }
                          placeholder="Busque uma cidade..."
                          disabled={!viagemState.rota.retorno.ufSaida}
                        />
                      </div>
                      <div>
                        <Label htmlFor="localsaida">Local saida</Label>
                        <Input
                          value={viagemState.rota.retorno.localDeSaida}
                          onChange={(e) =>
                            setViagem({
                              ...viagemState,
                              rota: {
                                ...viagemState.rota,
                                retorno: {
                                  ...viagemState.rota.retorno,
                                  localDeSaida: e.target.value,
                                },
                              },
                            })
                          }
                          name="localsaida"
                          type="text"
                          placeholder="digite o local de saída"
                        />
                      </div>
                      <div>
                        <Label htmlFor="date">Data retorno</Label>
                        <Input
                          value={viagemState.dataHorarioRetorno.data}
                          name="date"
                          type="date"
                          onChange={(e) =>
                            setViagem({
                              ...viagemState,
                              dataHorarioRetorno: {
                                ...viagemState.dataHorarioRetorno,
                                data: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="horariosaida">hora retorno </Label>
                        <Input
                          value={viagemState.dataHorarioRetorno.hora}
                          name="horariosaida"
                          onChange={(e) =>
                            setViagem({
                              ...viagemState,
                              dataHorarioRetorno: {
                                ...viagemState.dataHorarioRetorno,
                                hora: e.target.value,
                              },
                            })
                          }
                          type="time"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div>
                        <Label htmlFor="saidagaragem">Data Chegada</Label>
                        <Input
                          value={viagemState.dataHorarioChegada.data}
                          name="saidagaragem"
                          type="date"
                          onChange={(e) =>
                            setViagem({
                              ...viagemState,
                              dataHorarioChegada: {
                                ...viagemState.dataHorarioChegada,
                                data: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="horasaida">Hora Chegada</Label>
                        <Input
                          value={viagemState.dataHorarioChegada.hora}
                          name="horasaida"
                          type="time"
                          onChange={(e) =>
                            setViagem({
                              ...viagemState,
                              dataHorarioChegada: {
                                ...viagemState.dataHorarioChegada,
                                hora: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                    </div>
                  </fieldset>
                </div>
              </div>
              <div className="flex flex-col md:min-w-[20%]">
                <Label htmlFor="itinerario" className="text-md">
                  Itinerário
                </Label>
                <Textarea
                  value={viagemState.itinerario || ""}
                  name="itinerario"
                  className="border border-black rounded-md h-full"
                  onChange={(e) =>
                    setViagem({ ...viagemState, itinerario: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <fieldset className="rounded border border-yellow-500 p-4">
                <legend>Veiculo</legend>
                <div>
                  <Label htmlFor="veiculo">Veiculo</Label>
                  <Select
                    defaultValue={viagemState.veiculoId.toString()}
                    onValueChange={(e) => selecionarVeiculo(Number(e))}
                    name="veiculo"
                    required
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Selecionar Veiculo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {veiculos.map((veiculo) => (
                          <SelectItem
                            key={veiculo.id}
                            value={veiculo.id.toString()}
                          >
                            {veiculo.placa}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 ">
                  <div className="w-full">
                    <Label>Km Inicial</Label>
                    <Input
                      type="number"
                      onChange={(e) =>
                        setViagem({
                          ...viagemState,
                          kmInicialVeiculo: Number(e.target.value),
                        })
                      }
                      value={viagemState.kmInicialVeiculo}
                    />
                  </div>
                  <div className="w-full">
                    <Label>Km Final</Label>
                    <Input
                      onChange={(e) =>
                        setViagem({
                          ...viagemState,
                          kmFinalVeiculo: Number(e.target.value),
                        })
                      }
                      value={viagemState.kmFinalVeiculo}
                    />
                    {viagemState.kmFinalVeiculo > 0 && (
                      <span>
                        KM Diferença:{" "}
                        {viagemState.kmFinalVeiculo -
                          viagemState.kmInicialVeiculo}
                      </span>
                    )}
                  </div>
                </div>
              </fieldset>
              <fieldset className="rounded border border-blue-500 p-4">
                <legend>Motorista</legend>
                <div>
                  <Label htmlFor="motorista1">Motorista 1</Label>
                  <Select
                    defaultValue={
                      viagemState.motoristaViagens.length > 0
                        ? viagemState.motoristaViagens[0].motoristaId.toString()
                        : "0"
                    }
                    onValueChange={(e) => selecionarMotorista(Number(e), 1)}
                    name="motorista1"
                    required
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Selecionar Motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {motoristas.map((motorista) => (
                          <SelectItem
                            key={motorista.id}
                            value={motorista.id.toString()}
                          >
                            {motorista.nome}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Label htmlFor="motorista2">Motorista 2</Label>
                  <Select
                    onValueChange={(e) => selecionarMotorista(Number(e), 2)}
                    name="motorista2"
                    defaultValue={
                      viagemState.motoristaViagens.length > 1
                        ? viagemState.motoristaViagens[1].motoristaId.toString()
                        : "0"
                    }
                    required
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Selecionar Motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="0">Nenhum</SelectItem>
                        {motoristas
                          .filter(
                            (m) =>
                              m.id !== viagemState.motoristaViagens[0].motoristaId
                          )
                          .map((motorista) => (
                            <SelectItem
                              key={motorista.id}
                              value={motorista.id.toString()}
                            >
                              {motorista.nome}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </fieldset>
              <div>
                <Label htmlFor="status">Situacao da viagem</Label>
                <Select
                  value={viagemState.status.toString()}
                  onValueChange={(e) => setViagem({ ...viagemState, status: e })}
                  name="status"
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="absolute max-h-[200px]">
                    <SelectGroup>
                      {status_viagem.map((status_viagem) => (
                        <SelectItem
                          key={status_viagem.nome}
                          value={status_viagem.valor}
                        >
                          {status_viagem.nome}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor Parcial</Label>
                <Input
                  type="number"
                  value={valorParcial}
                  onChange={(e) => setValorParcial(Number(e.target.value))}
                  disabled={viagemState.status !== "CONFIRMADO"}
                ></Input>
              </div>
            </div>
          </div>
          <DialogFooter className="flex items-center gap-2">
            <DialogClose>
              <Button type="button" variant="outline" className="mb-10">
                Fechar
              </Button>
            </DialogClose>

            <Button type="submit" className="md:mb-10" disabled={isPending}>
              {isPending ? (
                <Image
                  src={loading}
                  alt="carregando"
                  className="text-center animate-spin"
                />
              ) : (
                "Atualizar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
