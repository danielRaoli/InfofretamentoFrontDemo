import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/axios";
import { Abastecimento, Adiantamento, Despesa, Viagem } from "@/lib/types";
import {
  ArrowRight,
  BadgeCheck,
  Bus,
  CalendarDays,
  DollarSign,
  Fuel,
  HandCoins,
  MapPin,
  ReceiptText,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { parseISO } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";
import loading from "../../assets/loading.svg";
import loadingDark from "../../assets/loading-dark.svg";
import GeneratePDF from "./contrato";
import { AdicionarDespesa } from "./dialog-adicionar-despesa";
import Link from "next/link";
import { AdicionarPagamento } from "./dialog-pagamento";
import removeIcon from "@/app/assets/remove.svg";
import {
  useQuery,
  UseQueryResult,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import ViagemPDF from "./dialog-document";

interface TravelDialogProps {
  viagemId: number;
  onClose: () => void;
}

interface ViagemResponse {
  viagem: Viagem;
  despesas: Despesa[];
  totalDespesa: number;
  valorPago: number;
  valorLiquidoViagem: number;
  abastecimentos: AbastecimentoDespesaViagem[];
}

interface AbastecimentoDespesaViagem {
  abastecimento: Abastecimento;
  despesa: Despesa;
}

export function TravelDialog({ viagemId, onClose }: TravelDialogProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(true);
  const [viagemState, setViagemState] = useState<ViagemResponse | null>(null);

  const { data: viagem }: UseQueryResult<ViagemResponse, Error> = useQuery({
    queryKey: ["viagemInfo", viagemId],
    queryFn: async () => {
      const response = await api.get(`viagem/${viagemId}`);
      const data = response.data.data as ViagemResponse;
      setViagemState(data);
      return data;
    },
  });

  const [adiantamento, setAdiantamento] = useState<Adiantamento>(
    viagem?.viagem.adiantamento ?? {
      id: 0,
      tipoVerba: "",
      verba: 0,
      valorDeAcerto: 0,
      diferenca: 0,
      descricao: "",
      viagemId: viagemId,
    }
  );
  const [abastecimento, setAbastecimento] = useState<Abastecimento>({
    id: 0,
    valorTotal: 0,
    viagemId: viagemId ?? 0,
    litros: 0,
    origemPagamento: "",
    dataVencimento: "",
  });

  useEffect(() => {
    if (viagemState?.viagem.adiantamento) {
      setAdiantamento(viagemState.viagem.adiantamento);
    }
  }, [viagemState]);

  const { mutate: createAbastecimento, isPending: isCreatingAbastecimento } =
    useMutation({
      mutationFn: async (abastecimento: Abastecimento) => {
        const response = await api.post("abastecimento", abastecimento);
        if (!response.data.isSucces) {
          throw new Error(
            "Não foi possível adicionar um abastecimento a viagem"
          );
        }
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["viagemInfo", viagemId] });
        toast.success("Abastecimento da viagem adicionado com sucesso");
        setAbastecimento({
          id: 0,
          valorTotal: 0,
          viagemId: viagemId,
          litros: 0,
          origemPagamento: "",
          dataVencimento: "",
        });
      },
      onError: () => {
        toast.error(
          "Não foi possível adicionar um abastecimento a viagem, tente novamente em alguns minutos"
        );
      },
    });

  const { mutate: updateAdiantamento, isPending: isUpdatingAdiantamento } =
    useMutation({
      mutationFn: async (adiantamento: Adiantamento) => {
        if (adiantamento.id === 0) {
          const response = await api.post("adiantamento", adiantamento);
          if (!response.data.isSucces) {
            throw new Error(
              "Não foi possível adicionar um adiantamento a viagem"
            );
          }
          return response.data;
        } else {
          const response = await api.put(
            `adiantamento/${adiantamento.id}, adiantamento`
          );
          if (!response.data.isSucces) {
            throw new Error(
              "Não foi possível atualizar o adiantamento da viagem"
            );
          }
          return response.data;
        }
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["viagemInfo", viagemId] });
        toast.success(
          adiantamento.id === 0
            ? "Adiantamento da viagem adicionado com sucesso"
            : "Adiantamento da viagem atualizado com sucesso"
        );
      },
      onError: (error: Error) => {
        toast.error(error.message);
      },
    });

  const { mutate: deleteAbastecimento, isPending: isDeletingAbastecimento } =
    useMutation({
      mutationFn: async (abastecimentoId: number) => {
        const response = await api.delete(`/abastecimento/${abastecimentoId}`);
        if (!response.data.isSucces) {
          throw new Error("Erro ao tentar remover abastecimento");
        }
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["viagemInfo", viagemId, "viagens"],
        });
        toast.success("Abastecimento da viagem removido com sucesso");
      },
      onError: () => {
        toast.error(
          "Erro ao tentar remover abastecimento, tente novamente em alguns minutos"
        );
      },
    });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  async function handleSubmitAbastecimento(e: React.FormEvent) {
    e.preventDefault();
    createAbastecimento(abastecimento);
  }

  async function handleSubmitAdiantamento(e: React.FormEvent) {
    e.preventDefault();
    updateAdiantamento(adiantamento);
  }

  function calcularValorTotal(valorTotal: number, litros: number) {
    const valor = valorTotal / litros;

    return valor.toFixed(2);
  }

  console.log("viagem:", viagemState);
  console.log(viagemState?.despesas[0]);
  console.log("Relação abastecimento-despesa:", {
    abastecimentos: viagemState?.abastecimentos.map((a) => ({
      id: a.abastecimento.id,
    })),
    despesas: viagemState?.despesas.map((d) => ({
      id: d.id,
      abastecimentoId: d.entidadeId,
    })),
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="md:max-w-3xl w-[90vw] rounded-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Informações Da Viagem</DialogTitle>
        </DialogHeader>

        {!viagem ? (
          <div className="flex flex-col items-center justify-center p-8">
            <h2 className="text-xl font-semibold text-gray-700">
              Viagem não encontrada
            </h2>
            <p className="text-gray-500">
              A viagem solicitada não foi encontrada ou estamos processando as
              informações, aguarde...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Viagem Detalhes
                </CardTitle>
              </CardHeader>
              <CardContent className="w-full space-y-6 md:px-14">
                {/* Origem e Destino */}
                <div className="flex justify-between w-full">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col items-start">
                      <Label>Origem</Label>
                      <p className="text-sm text-muted-foreground">
                        {viagem.viagem.rota.saida.cidadeSaida}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-muted-foreground" />

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div className="flex flex-col items-start">
                      <Label>Destino</Label>
                      <p className="text-sm text-muted-foreground">
                        {viagem.viagem.rota.retorno.cidadeSaida}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Datas */}
                <div className="flex justify-between w-full flex-wrap gap-4">
                  <div className="flex items-start gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground mt-1" />
                    <div className="flex flex-col items-start">
                      <Label>Data Partida</Label>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          toZonedTime(
                            parseISO(viagem.viagem.dataHorarioSaida.data ?? ""),
                            "UTC"
                          ),
                          "dd/MM/yyyy"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <CalendarDays className="w-4 h-4 text-muted-foreground mt-1" />
                    <div className="flex flex-col items-start">
                      <Label>Data Retorno</Label>
                      <p className="text-sm text-muted-foreground">
                        {format(
                          toZonedTime(
                            parseISO(
                              viagem.viagem.dataHorarioRetorno.data ?? ""
                            ),
                            "UTC"
                          ),
                          "dd/MM/yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Motoristas e Veículo */}
                <div className="flex justify-between w-full flex-wrap gap-4">
                  <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-muted-foreground mt-1" />
                    <div className="flex flex-col items-start">
                      <Label>Motoristas</Label>
                      {viagem.viagem.motoristaViagens?.map((motorista) => (
                        <p
                          key={motorista.motoristaId}
                          className="text-sm text-muted-foreground"
                        >
                          {motorista.motorista?.nome}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Bus className="w-4 h-4 text-muted-foreground mt-1" />
                    <div className="flex flex-col items-start">
                      <Label>Veículo</Label>
                      <p className="text-sm text-muted-foreground">
                        {viagem.viagem.veiculo?.prefixo} -{" "}
                        {viagem.viagem.veiculo?.placa}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-start gap-2">
                  <BadgeCheck className="w-4 h-4 text-muted-foreground mt-1" />
                  <div className="flex flex-col items-start">
                    <Label>Status</Label>
                    <p className="text-sm text-muted-foreground">
                      {viagem.viagem.status}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <CardFooter className="p-0 gap-2 justify-end">
                  <GeneratePDF viagem={viagem.viagem} />
                  <ViagemPDF dadosViagens={viagemState?.viagem} />
                </CardFooter>
              </CardContent>
            </Card>

            <Card className="w-full">
              <CardHeader>
                <CardTitle>
                  Valor Líquido:{" "}
                  <strong className="text-green-600">
                    {formatCurrency(viagem.valorLiquidoViagem ?? 0)}
                  </strong>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Card className="flex justify-center flex-col p-2 gap-2 items-center w-full md:w-[200px]">
                  <CardTitle>Abastecimento</CardTitle>
                  <div className="flex gap-2">
                    <Fuel className="text-yellow-500" />
                    <span>
                      {formatCurrency(
                        viagem.viagem.abastecimentos.reduce(
                          (total, abastecimento) =>
                            total + (abastecimento.valorTotal || 0),
                          0
                        ) ?? 0
                      )}
                    </span>
                  </div>
                </Card>

                <Card className="flex justify-center flex-col p-2 gap-2 items-center w-full md:w-[200px]">
                  <CardTitle>Adiantamentos</CardTitle>
                  <div className="flex gap-2">
                    <DollarSign className="text-blue-600" />
                    <span>
                      {viagem.viagem.adiantamento
                        ? formatCurrency(
                            viagem.viagem.adiantamento.valorDeAcerto
                          )
                        : "0,00 R$"}
                    </span>
                  </div>
                </Card>

                <Card className="flex flex-col justify-center p-2 gap-2 items-center w-full md:w-[200px]">
                  <CardTitle>Despesas</CardTitle>
                  <div className="flex gap-2">
                    <HandCoins className="text-red-600" />
                    <span>{formatCurrency(viagem.totalDespesa ?? 0)}</span>
                  </div>
                </Card>

                <Card className="flex flex-col p-2 gap-2 items-center md:w-[200px] w-full">
                  <CardTitle>Valor Contrato</CardTitle>
                  <div className="flex gap-2">
                    <ReceiptText className="text-green-500" />
                    <span>
                      {formatCurrency(viagem.viagem.valorContratado ?? 0)}
                    </span>
                  </div>
                </Card>
              </CardContent>
            </Card>

            <Card className="w-full relative">
              <CardHeader>
                <CardTitle className="text-red-600">Despesas</CardTitle>
                <AdicionarDespesa viagemId={viagemId} />
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Origem do Pagamento</TableHead>
                      <TableHead>Pago</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viagem.despesas.length > 0 ? (
                      viagem.despesas.map((despesa: Despesa) => (
                        <TableRow key={despesa.id}>
                          <TableCell>
                            {formatCurrency(despesa.valorTotal)}
                          </TableCell>
                          <TableCell>{despesa.centroCusto}</TableCell>
                          <TableCell>
                            {despesa.pago ? (
                              <Badge variant="secondary" className="text-white">
                                Pago
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Pendente</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Link
                              className="text-blue-500 font-bold"
                              href={`/financeiro?despesaCode=${despesa.id}`}
                            >
                              Ver Mais
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>Sem despesas</TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="w-full relative">
              {viagem.viagem.receita && viagemState && (
                <AdicionarPagamento
                  receitaId={Number(viagem.viagem.receita.id)}
                />
              )}
              <CardHeader>
                <CardTitle className="text-green-600">Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableCell>Data Pagamento</TableCell>
                      <TableHead>Valor Pagamento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viagem.viagem.receita ? (
                      viagem.viagem.receita.pagamentos.map((pagamento) => (
                        <TableRow key={pagamento.id}>
                          <TableCell>
                            {" "}
                            {format(
                              toZonedTime(
                                parseISO(pagamento.dataPagamento),
                                "UTC"
                              ),
                              "dd/MM/yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(pagamento.valorPago)}
                          </TableCell>
                          <TableCell>
                            {
                              <Link
                                className="text-blue-500 font-bold"
                                href={`/financeiro?receita=${
                                  viagem.viagem.receita!.id
                                }`}
                              >
                                Ver Mais
                              </Link>
                            }
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>Sem receitas</TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className="flex justify-between mt-6">
                  <span>
                    Valor Total:{" "}
                    <strong>{viagem.viagem.valorContratado}</strong>{" "}
                  </span>
                  <span>
                    Valor Pago: <strong>{viagem.valorPago}</strong>
                  </span>
                  <span>
                    Valor Pendente:{" "}
                    <strong className="text-red-600">
                      {" "}
                      {viagem.viagem.valorContratado -
                        (viagem.viagem.receita ? viagem.valorPago : 0)}
                    </strong>
                  </span>
                </div>
              </CardContent>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Abastecimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Litros</TableHead>
                      <TableHead>Valor/Litro</TableHead>
                      <TableHead>Valor Total</TableHead>
                      <TableHead>Origem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {viagemState?.abastecimentos.map(
                      ({ abastecimento, despesa }) => (
                        <TableRow key={abastecimento.id}>
                          <TableCell>
                            {despesa?.vencimento
                              ? format(
                                  toZonedTime(
                                    parseISO(despesa.vencimento),
                                    "UTC"
                                  ),
                                  "dd/MM/yyyy"
                                )
                              : "Sem data"}
                          </TableCell>
                          <TableCell>{abastecimento.litros}</TableCell>
                          <TableCell>
                            {formatCurrency(
                              abastecimento.valorTotal / abastecimento.litros
                            )}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(abastecimento.valorTotal)}
                          </TableCell>
                          <TableCell>{abastecimento.origemPagamento}</TableCell>
                          <TableCell className="flex gap-2">
                            <Button
                              disabled={isDeletingAbastecimento}
                              onClick={() =>
                                deleteAbastecimento(abastecimento.id)
                              }
                              className="bg-transparent hover:bg-white/85"
                            >
                              {isDeletingAbastecimento ? (
                                <Image
                                  src={loadingDark}
                                  alt="loading"
                                  className="text-center animate-spin"
                                />
                              ) : (
                                <Image
                                  src={removeIcon}
                                  alt="Remover"
                                  width={25}
                                  className="w-6"
                                />
                              )}
                            </Button>
                            <Button
                              disabled={!despesa}
                              className={`bg-blue-600 hover:bg-blue-600/85 rounded-md text-white flex items-center justify-center px-2 py-1 ${
                                !despesa ? "opacity-50 cursor-not-allowed" : ""
                              }`}
                            >
                              <Link
                                href={`/financeiro?despesaCode=${
                                  despesa?.id ?? abastecimento.id
                                }`}
                                className={
                                  !despesa ? "pointer-events-none" : ""
                                }
                              >
                                Ver Mais
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Abastecimento da viagem</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmitAbastecimento}
                  className="flex flex-col w-full"
                >
                  <div className="w-full flex gap-2 items-start ">
                    <div className="grid gap-2">
                      <Label htmlFor="dataPagamento">Data de Vencimento</Label>
                      <Input
                        id="dataPagamento"
                        name="dataPagamento"
                        type="date"
                        defaultValue={abastecimento?.dataVencimento}
                        required
                        onChange={(e) =>
                          setAbastecimento({
                            ...abastecimento!,
                            dataVencimento: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="valorTotal">Total Value (R$)</Label>
                      <Input
                        id="valorTotal"
                        name="valorTotal"
                        defaultValue={
                          abastecimento?.valorTotal
                            ? abastecimento.valorTotal
                            : ""
                        }
                        onChange={(e) =>
                          setAbastecimento({
                            ...abastecimento!,
                            valorTotal: Number(e.target.value),
                          })
                        }
                        type="number"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="litros">Litros</Label>
                      <Input
                        id="litros"
                        name="litros"
                        type="number"
                        step="0.01"
                        defaultValue={
                          abastecimento?.litros ? abastecimento.litros : ""
                        }
                        required
                        onChange={(e) =>
                          setAbastecimento({
                            ...abastecimento!,
                            litros: Number(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="origem">Origem</Label>
                      <Input
                        id="origem"
                        name="origem"
                        type="text"
                        defaultValue={abastecimento?.origemPagamento}
                        onChange={(e) =>
                          setAbastecimento({
                            ...abastecimento!,
                            origemPagamento: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="space-x-2 mb-2">
                      {abastecimento!.valorTotal > 0 ? (
                        <span>
                          Valor Litro: R${" "}
                          {calcularValorTotal(
                            abastecimento!.valorTotal,
                            abastecimento!.litros
                          )}
                        </span>
                      ) : (
                        <span>Valor Litro: 0</span>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isCreatingAbastecimento}
                    className="w-full"
                  >
                    {isCreatingAbastecimento ? (
                      <Image
                        src={loading}
                        alt="loading"
                        className="text-center animate-spin"
                      />
                    ) : (
                      "Registrar"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Adiantamento de viagem</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={handleSubmitAdiantamento}
                  className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="tipoVerba">Origem</Label>
                    <input
                      type="text"
                      id="tipoVerba"
                      value="Motorista"
                      readOnly
                      className="border border-gray-300 w-[120px] px-2 py-1 rounded"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="verba">Valor</Label>
                    <Input
                      id="verba"
                      name="verba"
                      value={adiantamento ? adiantamento.verba : 0}
                      onChange={(e) =>
                        setAdiantamento({
                          ...adiantamento!,
                          verba: Number(e.target.value),
                        })
                      }
                      type="number"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="valorDeAcerto">Valor de Acerto</Label>
                    <Input
                      id="valorDeAcerto"
                      name="valorDeAcerto"
                      value={adiantamento ? adiantamento.valorDeAcerto : 0}
                      onChange={(e) =>
                        setAdiantamento({
                          ...adiantamento!,
                          valorDeAcerto: Number(e.target.value),
                        })
                      }
                      required
                      type="number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="diferenca">Diferença</Label>
                    <Input
                      id="diferenca"
                      name="diferenca"
                      value={adiantamento!.verba - adiantamento!.valorDeAcerto}
                      required
                      disabled
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      defaultValue={adiantamento!.descricao}
                      onChange={(e) =>
                        setAdiantamento({
                          ...adiantamento!,
                          descricao: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isUpdatingAdiantamento}
                    className="w-full"
                  >
                    {isUpdatingAdiantamento ? (
                      <Image
                        src={loading}
                        alt="loading"
                        className="text-center animate-spin"
                      />
                    ) : (
                      "Atualizar"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
