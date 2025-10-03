"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Cidade, Cliente, Motorista, Uf, Veiculo, Viagem } from "@/lib/types";
import { DialogClose } from "@radix-ui/react-dialog";
import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import loading from "../../assets/loading.svg";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CustomCitySelect } from "@/components/custom-city-selector";

async function fetchClientes() {
  const response = await api.get("/cliente");
  return response.data.data as Cliente[];
}

async function fetchMotoristas() {
  const response = await api.get("/motorista");
  return response.data.data as Motorista[];
}

async function fetchVeiculos() {
  const response = await api.get("/veiculo");
  return response.data.data as Veiculo[];
}

export default function DialogAdicionar() {
  const [cidadesSaida, setCidadesSaida] = useState<Cidade[]>([]);
  const [cidadesRetorno, setCidadesRetorno] = useState<Cidade[]>([]);
  const [motorista1, setMotorista1] = useState<number>(0);
  const [motorista2, setMotorista2] = useState<number>(0);
  const [valorParcial, setValorParcial] = useState<number>(0);
  const [viagem, setViagem] = useState<Viagem>({
    id: 0,
    rota: {
      saida: {
        ufSaida: "",
        cidadeSaida: "",
        localDeSaida: "",
      },
      retorno: {
        ufSaida: "",
        cidadeSaida: "",
        localDeSaida: "",
      },
    },
    dataHorarioSaida: {
      data: "",
      hora: "",
    },
    dataHorarioRetorno: {
      data: "",
      hora: "",
    },
    dataHorarioSaidaGaragem: {
      data: "",
      hora: "",
    },
    dataHorarioChegada: {
      data: "",
      hora: "",
    },
    clienteId: 0,
    tipoServico: "",
    status: "",
    tipoViagem: "",
    tipoPagamento: "",
    valorContratado: 0,
    itinerario: "",
    veiculoId: 0,
    motoristaViagens: [],
    motoristasId: [],
    abastecimentos: [],
    kmInicialVeiculo: 0,
    kmFinalVeiculo: 0,
    receita: undefined,
    totalDespesa: 0,
    valorLiquidoViagem: 0,
  });

  const { data: ufsData } = useQuery({
    queryKey: ["ufs"],
    queryFn: async () => {
      const response = await axios.get<Uf[]>(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      );
      return response.data.sort((a, b) => a.nome.localeCompare(b.nome));
    },
  });

  const { data: veiculosData = [] } = useQuery({
    queryKey: ["veiculos"],
    queryFn: fetchVeiculos,
  });

  const { data: motoristasData = [] } = useQuery({
    queryKey: ["motoristas"],
    queryFn: fetchMotoristas,
  });

  const { data: clientesData = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: fetchClientes,
  });

  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation<Viagem, Error, Viagem>({
    mutationFn: async (request: Viagem) => {
      const response = await api.post("/viagem", request);
      return response.data.data as Viagem;
    },
    onSuccess: () => {
      toast.success("Viagem adicionada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["viagens"] });
    },
    onError: () => {
      toast.error("Erro ao adicionar viagem");
    },
  });

  const handleUfSaidaChange = (uf: string) => {
    setViagem({
      ...viagem,
      rota: { ...viagem.rota, saida: { ...viagem.rota.saida, ufSaida: uf } },
    });
    axios
      .get<Cidade[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
      )
      .then((response) => {
        const sortedCidades = response.data.sort((a, b) =>
          a.nome.localeCompare(b.nome)
        );
        setCidadesSaida(sortedCidades);
      })
      .catch((error) => {
        console.error("Error fetching cidades:", error);
      });
  };

  const handleUfDestinoChange = (uf: string) => {
    setViagem({
      ...viagem,
      rota: {
        ...viagem.rota,
        retorno: { ...viagem.rota.retorno, ufSaida: uf },
      },
    });
    axios
      .get<Cidade[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
      )
      .then((response) => {
        const sortedCidades = response.data.sort((a, b) =>
          a.nome.localeCompare(b.nome)
        );
        setCidadesRetorno(sortedCidades);
      })
      .catch((error) => {
        console.error("Error fetching cidades:", error);
      });
  };

  function selecionarVeiculo(id: number) {
    const veiculoSelecionado = veiculosData.find(
      (v: Veiculo) => Number(v.id) === id
    );
    setViagem((prevViagem) => ({
      ...prevViagem,
      veiculoId: id,
      veiculo: veiculoSelecionado,
      kmInicialVeiculo: Number(veiculoSelecionado?.kmAtual),
    }));
  }

  function selecionarMotorista(id: number, motorista: number) {
    if (motorista === 1) {
      // Atualiza motorista1 e reinicia a lista com apenas motorista1
      setMotorista1(id);
      setMotorista2(0); // Reseta motorista2
      setViagem({
        ...viagem,
        motoristasId: [id], // Lista com apenas motorista1
      });
    } else if (motorista === 2 && motorista1 !== motorista2) {
      // Atualiza motorista2 sem remover motorista1 da lista
      setMotorista2(id);
      setViagem((prevViagem) => ({
        ...prevViagem,
        motoristasId: [
          motorista1, // Garante que motorista1 permaneça na lista
          ...prevViagem.motoristasId.filter(
            (m) => m !== motorista2 && m !== motorista1
          ), // Remove apenas o antigo motorista2
          id, // Adiciona o novo motorista2
        ],
      }));
    }

    console.log(motorista1, motorista2);
  }

  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const clientesFiltrados = clientesData.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
  )

  function selecionarCliente(cliente: Cliente) {
    setSearchTerm(cliente.nome)
    setViagem(prev => ({
      ...prev,
      clienteId: cliente.id,
      cliente: cliente
    }))
    setShowSuggestions(false)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

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
    { nome: "Cancelado", valor: "TURISMO_RELIGIOSO" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="bg-green-600 hover:bg-green-500 w-[250px] md:w-[250px] rounded-sm text-white text-center p-1 cursor-pointer transition-all">
          Adicionar Viagem/Serviço
        </span>
      </DialogTrigger>
      <DialogContent className="md:max-w-[1200px] w-[90vw] max-h-[90vh] rounded-md flex flex-col items-center overflow-scroll">
        <DialogHeader className="mb-5">
          <DialogTitle className="font-black">
            Cadastro de Viagem/Serviço
          </DialogTitle>
        </DialogHeader>
        <form
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            mutate(viagem);
          }}
        >
          <div className="flex h-full overflow-y-scroll md:overflow-auto flex-col">
            <div className="w-full flex flex-col md:flex-row md:h-[200px] justify-evenly gap-4">
              <fieldset className="border h-[200px] border-blue-900 rounded-md p-4 flex-1 flex-col md:flex-row flex gap-2">
                <legend>Cliente</legend>
                <div className="flex-1">
                  <div className="relative w-[250px]" ref={containerRef}>
                    <label className="block mb-1 text-sm font-medium">Cliente</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded h-[36px] px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Digite para buscar..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => setShowSuggestions(true)}
                    />

                    {showSuggestions && (
                      <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-auto shadow">
                        {clientesFiltrados.length > 0 ? (
                          clientesFiltrados.map(cliente => (
                            <li
                              key={cliente.id}
                              className="px-3 py-2 hover:bg-blue-500 hover:text-white cursor-pointer"
                              onClick={() => selecionarCliente(cliente)}
                            >
                              {cliente.nome}
                            </li>
                          ))
                        ) : (
                          <div className="p-2 text-sm text-gray-500">Nenhum cliente encontrado</div>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <Label htmlFor="telefone">Telefone Cliente</Label>
                  <Input
                    name="telefone"
                    value={
                      clientesData &&
                      clientesData.find(
                        (cliente: Cliente) => cliente.id == viagem.clienteId
                      )?.telefone
                    }
                    placeholder="(xx) x xxxx-xxxx"
                    type="tel"
                    id="telefone"
                  />
                </div>
              </fieldset>
              <fieldset className="border border-blue-900 flex-1 flex-col md:flex-row rounded-md p-4 flex gap-2">
                <legend>Servico</legend>
                <div className="flex-1">
                  <Label htmlFor="tiposervico">Tipo do Servico</Label>
                  <Select
                    onValueChange={(e) =>
                      setViagem({ ...viagem, tipoServico: e })
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
                    onValueChange={(e) =>
                      setViagem({ ...viagem, tipoViagem: e })
                    }
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
                    onValueChange={(e) =>
                      setViagem({ ...viagem, tipoPagamento: e })
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
                    name="valor"
                    onChange={(e) =>
                      setViagem({
                        ...viagem,
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
                          value={viagem.rota.saida.ufSaida}
                          onValueChange={handleUfSaidaChange}
                          name="ufsaida"
                        >
                          <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Uf" />
                          </SelectTrigger>
                          <SelectContent className="absolute max-h-[200px]">
                            <SelectGroup>
                              {ufsData?.map((uf) => (
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
                          value={viagem.rota.saida.cidadeSaida}
                          onSelect={(cityName) =>
                            setViagem({
                              ...viagem,
                              rota: {
                                ...viagem.rota,
                                saida: {
                                  ...viagem.rota.saida,
                                  cidadeSaida: cityName,
                                },
                              },
                            })
                          }
                          placeholder="Busque uma cidade..."
                          disabled={!viagem.rota.saida.ufSaida}
                        />
                      </div>

                      <div>
                        <Label htmlFor="localsaida">Local saida</Label>
                        <Input
                          onChange={(e) =>
                            setViagem({
                              ...viagem,
                              rota: {
                                ...viagem.rota,
                                saida: {
                                  ...viagem.rota.saida,
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
                          name="date"
                          type="date"
                          onChange={(e) =>
                            setViagem({
                              ...viagem,
                              dataHorarioSaida: {
                                ...viagem.dataHorarioSaida,
                                data: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="horariosaida">Horario </Label>
                        <Input
                          name="horariosaida"
                          onChange={(e) =>
                            setViagem({
                              ...viagem,
                              dataHorarioSaida: {
                                ...viagem.dataHorarioSaida,
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
                          name="saidagaragem"
                          type="date"
                          onChange={(e) =>
                            setViagem({
                              ...viagem,
                              dataHorarioSaidaGaragem: {
                                ...viagem.dataHorarioSaidaGaragem,
                                data: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="horasaida">Hora Saida</Label>
                        <Input
                          name="horasaida"
                          type="time"
                          onChange={(e) =>
                            setViagem({
                              ...viagem,
                              dataHorarioSaidaGaragem: {
                                ...viagem.dataHorarioSaidaGaragem,
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
                          value={viagem.rota.retorno.ufSaida}
                          onValueChange={handleUfDestinoChange}
                          name="ufdestino"
                        >
                          <SelectTrigger className="w-auto">
                            <SelectValue placeholder="Uf" />
                          </SelectTrigger>
                          <SelectContent className="absolute max-h-[200px]">
                            <SelectGroup>
                              {ufsData?.map((uf) => (
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
                          cities={cidadesRetorno}
                          value={viagem.rota.retorno.cidadeSaida}
                          onSelect={(cityName) =>
                            setViagem({
                              ...viagem,
                              rota: {
                                ...viagem.rota,
                                retorno: {
                                  ...viagem.rota.retorno,
                                  cidadeSaida: cityName,
                                },
                              },
                            })
                          }
                          placeholder="Busque uma cidade..."
                          disabled={!viagem.rota.retorno.ufSaida}
                        />
                      </div>

                      <div>
                        <Label htmlFor="localsaida">Local saida</Label>
                        <Input
                          onChange={(e) =>
                            setViagem({
                              ...viagem,
                              rota: {
                                ...viagem.rota,
                                retorno: {
                                  ...viagem.rota.retorno,
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
                          name="date"
                          type="date"
                          onChange={(e) =>
                            setViagem({
                              ...viagem,
                              dataHorarioRetorno: {
                                ...viagem.dataHorarioRetorno,
                                data: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="horariosaida">hora retorno </Label>
                        <Input
                          name="horariosaida"
                          onChange={(e) =>
                            setViagem({
                              ...viagem,
                              dataHorarioRetorno: {
                                ...viagem.dataHorarioRetorno,
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
                          name="saidagaragem"
                          type="date"
                          onChange={(e) =>
                            setViagem({
                              ...viagem,
                              dataHorarioChegada: {
                                ...viagem.dataHorarioChegada,
                                data: e.target.value,
                              },
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="horasaida">Hora Chegada</Label>
                        <Input
                          name="horasaida"
                          type="time"
                          onChange={(e) =>
                            setViagem({
                              ...viagem,
                              dataHorarioChegada: {
                                ...viagem.dataHorarioChegada,
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
                  Itinerario
                </Label>
                <Textarea
                  name="itinerario"
                  id=""
                  className="border border-black rounded-md h-full"
                  onChange={(e) =>
                    setViagem({ ...viagem, itinerario: e.target.value })
                  }
                ></Textarea>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <fieldset className="rounded border border-yellow-500 p-4">
                <legend>Veiculo</legend>
                <div>
                  <Label htmlFor="veiculo">Veiculo</Label>
                  <Select
                    onValueChange={(e) => selecionarVeiculo(Number(e))}
                    name="veiculo"
                    required
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Selecionar Veiculo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {veiculosData.map((veiculo: Veiculo) => (
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
                <div>
                  <Label>Km Inicial</Label>
                  <Input
                    type="number"
                    onChange={(e) =>
                      setViagem({
                        ...viagem,
                        kmInicialVeiculo: Number(e.target.value),
                      })
                    }
                    value={viagem.kmInicialVeiculo}
                    defaultValue={viagem.kmInicialVeiculo}
                  />
                </div>
              </fieldset>
              <fieldset className="rounded border border-blue-500 p-4">
                <legend>Motorista</legend>
                <div>
                  <Label htmlFor="motorista1">Motorista 1</Label>
                  <Select
                    onValueChange={(e) => selecionarMotorista(Number(e), 1)}
                    name="motorista1"
                    required
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Selecionar Motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {motoristasData.map((motorista: Motorista) => (
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
                    disabled={motorista1 === 0}
                  >
                    <SelectTrigger className="w-auto">
                      <SelectValue placeholder="Selecionar Motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="0">Nenhum</SelectItem>
                        {motoristasData
                          .filter((m: Motorista) => m.id !== motorista1)
                          .map((motorista: Motorista) => (
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
                  value={viagem.status}
                  onValueChange={(e) => setViagem({ ...viagem, status: e })}
                  name="status"
                >
                  <SelectTrigger className="w-auto">
                    <SelectValue placeholder="Situação" />
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
                  disabled={viagem.status !== "CONFIRMADO"}
                ></Input>
              </div>
            </div>
          </div>
          <DialogFooter className="flex flex-row justify-center items-center gap-2 pb-10">
            <DialogClose>
              <Button type="button" variant="outline">
                Fechar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Image
                  src={loading}
                  alt="carregando"
                  className="text-center animate-spin"
                />
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
