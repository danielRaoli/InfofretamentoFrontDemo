import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  Calendar,
  CreditCard,
  Building2,
  DollarSign,
} from "lucide-react";
import { Despesa, PagamentoDespesa } from "@/lib/types";
import Image from "next/image";
import DocumentIcon from "@/app/assets/dadosviagem.svg";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { useState } from "react";
import DialogRemoverPagamento from "./dialog-remover-pagamento";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/lib/axios";
import loading from "@/app/assets/loading.svg";
interface DespesasDialogProps {
  despesa: Despesa;
  setDespesas: React.Dispatch<React.SetStateAction<Despesa[]>>;
  despesas: Despesa[];
}

export function DialogInfo({
  despesa,
  setDespesas,
  despesas,
}: DespesasDialogProps) {
  const [despesaInfo, setDespesaInfo] = useState<Despesa>(despesa);
  const [dataPagamento, setDataPagamento] = useState<string | null>(null);
  const [pagamentoDespesa, setPagamentoDespesa] = useState<PagamentoDespesa>({
    despesaId: Number(despesa.id),
    valorPago: 0,
    id: 0,
    dataPagamento: "",
    despesa,
  });
  //const formatDate = (date: string) => new Date(date).toLocaleDateString();
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const [adicionandoBoleto, setAdicionandoBoleto] = useState(false);
  const [adicionandoPagamento, setAdicionandoPagamento] = useState(false);

  async function gerarPagamento(e: React.FormEvent) {
    try {
      e.preventDefault();
      setAdicionandoPagamento(true);
      if (pagamentoDespesa.valorPago <= 0) {
        toast("digite um valor valido para o pagamento");
        return;
      }

      const response = await api.post("/despesa/pagamentoDespesa", {
        despesaId: Number(despesa.id),
        valorPago: pagamentoDespesa.valorPago,
        dataPagamento: dataPagamento,
      });
      
      if (!response.data.isSucces) {
        toast("erro ao tentar gerar pagamento");
        return;
      }

      const pagamentosAtualizados = [
        ...despesaInfo.pagamentos,
        response.data.data,
      ];

      setDespesaInfo({
        ...despesaInfo,
        pagamentos: pagamentosAtualizados,
        pago:
          despesaInfo.valorTotal ===
          pagamentosAtualizados.reduce((p, c) => p + c.valorPago, 0),
      });

      const despesasAtualizadas = despesas.filter(
        (despesa) => despesa.id !== despesaInfo.id
      );

      setDespesas([
        ...despesasAtualizadas,
        {
          ...despesaInfo,
          pagamentos: pagamentosAtualizados,
          pago:
            despesaInfo.valorTotal ===
            pagamentosAtualizados.reduce((p, c) => p + c.valorPago, 0),
        },
      ]);

      toast("pagamento adicionado com sucesso");
    } catch {
      toast("erro ao tentar gerar pagamento");
    } finally {
      setAdicionandoPagamento(false);
    }
  }

  async function pagarBoleto(boletoId: number, e: React.FormEvent) {
    try {
      e.preventDefault();
      setAdicionandoBoleto(true);
      const response = await api.post(`despesa/pagamentoboleto`, {
        id: boletoId,
        dataPagamento: dataPagamento,
      });
      if (!response.data.isSucces) {
        toast("erro ao tenta pagar boleto");
        return;
      }

      const boletosAtualizados = despesaInfo.boletos.filter(
        (b) => b.id !== boletoId
      );

      const parcelasPagas = despesaInfo.parcelasPagas + 1;

      setDespesaInfo({
        ...despesaInfo,
        boletos: [...boletosAtualizados, response.data.data],
        parcelasPagas: parcelasPagas,
        pago: parcelasPagas === despesaInfo.parcelas,
      });

      const despesasAtualizadas = despesas.filter(
        (despesa) => despesa.id !== despesaInfo.id
      );

      setDespesas([
        ...despesasAtualizadas,
        {
          ...despesaInfo,
          boletos: [...boletosAtualizados, response.data.data],
          parcelasPagas: parcelasPagas,
          pago: parcelasPagas === despesaInfo.parcelas,
        },
      ]);
      toast("boleto pago com sucesso");
    } catch {
      toast("erro ao tentar pagar boleto");
    } finally {
      setAdicionandoBoleto(false);
      setDataPagamento(null);
    }
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="bg-transparent shadow-none p-0 hover:bg-transparent hover:scale-110 cursor-pointer transition-all">
          <Image
            src={DocumentIcon}
            alt="documento"
            width={25}
            className="w-6"
          />
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] md:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="h-5 w-5" />
            Despesa # {despesaInfo.id}
          </DialogTitle>
          <span>{despesaInfo.descricao}</span>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">Status e Valores</h3>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>

                  <Badge variant={despesaInfo.pago ? "default" : "destructive"}>
                    {despesaInfo.pago ? "Pago" : "Pendente"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Valor Total: {formatCurrency(despesaInfo.valorTotal)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  {despesaInfo.formaPagamento === "Boleto" ? (
                    <div className="space-x-2">
                      <span>Parcelas Pagas: {despesaInfo.parcelasPagas}</span>
                      <span>Total de Parcelas: {despesaInfo.parcelas}</span>
                    </div>
                  ) : (
                    <span>
                      Valor Parcial: {formatCurrency(despesaInfo.valorParcial)}
                    </span>
                  )}
                </div>
              </div>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold mb-3">Datas</h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Compra:{" "}
                    {format(
                      toZonedTime(parseISO(despesaInfo.dataCompra), "UTC"),
                      "dd/MM/yyyy"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Vencimento:{" "}
                    {format(
                      toZonedTime(
                        parseISO(
                          despesaInfo.vencimento ? despesaInfo.vencimento : ""
                        ),
                        "UTC"
                      ),
                      "dd/MM/yyyy"
                    )}
                  </span>
                </div>
              </div>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold mb-3">
                Informações de Pagamento
              </h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Forma de Pagamento: {despesaInfo.formaPagamento}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>Origem: {despesaInfo.centroCusto}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>Centro de Custo: {despesaInfo.centroCusto}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>Descricao: {despesaInfo.descricao}</span>
                </div>
              </div>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold mb-3">Pagamentos</h3>
              {despesaInfo.formaPagamento === "Boleto" ? (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Valor</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Pago</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {despesaInfo.boletos.map((boleto) => (
                        <TableRow key={boleto.id}>
                          <TableCell>{formatCurrency(boleto.valor)}</TableCell>
                          <TableCell>
                            {format(
                              toZonedTime(parseISO(boleto.vencimento), "UTC"),
                              "dd/MM/yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            {boleto.pago ? (
                              format(
                                toZonedTime(
                                  parseISO(boleto.dataPagamento!),
                                  "UTC"
                                ),
                                "dd/MM/yyyy"
                              )
                            ) : (
                              <Badge className="bg-red-600">Pendente</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {!boleto.pago && (
                              <form onSubmit={(e) => pagarBoleto(boleto.id, e)}>
                                <input
                                  type="hidden"
                                  name="boletoId"
                                  value={boleto.id}
                                />
                                <input
                                  type="date"
                                  value={dataPagamento ?? ""}
                                  onChange={(e) =>
                                    setDataPagamento(e.target.value)
                                  }
                                  className="w-min"
                                />
                                <Button type="submit" className="bg-blue-600">
                                  {adicionandoBoleto ? (
                                    <Image
                                      src={loading}
                                      alt="loading"
                                      className="text-center animate-spin"
                                    />
                                  ) : (
                                    "Pagar"
                                  )}
                                </Button>
                              </form>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <div className="w-full flex flex-col">
                  <Card>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Valor Pago</TableHead>
                          <Table>doc</Table>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(despesaInfo.pagamentos || []).length > 0 ? (
                          despesaInfo.pagamentos.map((pagamento) => (
                            <TableRow key={pagamento.id}>
                              <TableCell>
                                {format(
                                  toZonedTime(
                                    parseISO(pagamento.dataPagamento),
                                    "UTC"
                                  ),
                                  "dd/MM/yyyy"
                                )}
                              </TableCell>
                              <TableCell>{pagamento.valorPago}</TableCell>
                              <TableCell className="flex gap-2">
                                <DialogRemoverPagamento
                                  despesa={despesaInfo}
                                  setDespesa={setDespesaInfo}
                                  pagamentoId={pagamento.id}
                                />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <span>Sem registro de pagamentos</span>
                        )}
                      </TableBody>
                    </Table>
                  </Card>

                  <h3 className="text-lg font-semibold mb-3">
                    Adicionar Pagamento
                  </h3>
                  <form
                    onSubmit={(e) => gerarPagamento(e)}
                    className="p-2 flex gap-2 items-end w-full"
                  >
                    <div className="flex-1">
                      <Label>Valor Pago</Label>
                      <Input
                        type="number"
                        value={
                          pagamentoDespesa?.valorPago
                            ? pagamentoDespesa?.valorPago
                            : ""
                        }
                        onChange={(e) =>
                          setPagamentoDespesa({
                            ...pagamentoDespesa,
                            valorPago: Number(e.target.value),
                          })
                        }
                        placeholder="R$ 0,00"
                      />
                    </div>
                    <div className="flex-1">
                      <Label>Data de Pagamento</Label>
                      <Input
                        type="date"
                        value={dataPagamento ?? ""}
                        onChange={(e) => setDataPagamento(e.target.value)}
                      />
                    </div>
                    {
                      <Button
                        type="submit"
                        disabled={adicionandoPagamento}
                        className="bg-green-600"
                      >
                        {adicionandoPagamento ? (
                          <Image
                            src={loading}
                            alt="loading"
                            className="text-center animate-spin"
                          />
                        ) : (
                          "Gerar pagamento"
                        )}
                      </Button>
                    }
                  </form>
                </div>
              )}
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
