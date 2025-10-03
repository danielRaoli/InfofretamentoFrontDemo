"use client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Despesa, DespesaMensal, IReceitas, Salario } from "@/lib/types";
import { api } from "@/lib/axios";
import loading from "../assets/loading-dark.svg";
import { Input } from "@/components/ui/input";
import DialogRemoverReceita from "./components/receitas/dialog-remover";
import { DialogInfo } from "./components/despesas/dialog-informacoes";
import DespesaPDF from "./components/despesas/dialog-document";
import { toast } from "sonner";
import axios from "axios";
import { Search } from "lucide-react";
import { DialogInformacoesReceitas } from "./components/receitas/dialog-informacoes";
import GeneratePDF from "./components/receitas/recibo";
import { parseISO } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";
import { Badge } from "@/components/ui/badge";
import { FinancialDialogs } from "./components/despesas-mensais/adicionar-salario";
import { RemoverDialog } from "./components/despesas-mensais/remover-despesa";
import { EditarDespesa } from "./components/despesas-mensais/dialog-editar-despesa";
import { EditarSalario } from "./components/despesas-mensais/dialog-editar-salario";
import { RemoverSalario } from "./components/despesas-mensais/remover-salario";
import { AdicionarDespesa } from "./components/despesas/adicionar-despesa";
import removeIcon from "@/app/assets/remove.svg";
import RemoverDespesa from "./components/despesas/dialog-remover";

export default function Financeiro() {
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [receitas, setReceitas] = useState<IReceitas[]>([]);
  const [salarios, setSalarios] = useState<Salario[]>([]);
  const [despesasMensais, setDespesasMensais] = useState<DespesaMensal[]>([]);
  const [mes, setMes] = useState<string>("");
  const [ano, setAno] = useState<string>("");
  const [carregando, setCarregando] = useState(false);
  const [statusFiltro, setStatusFiltro] = useState("todas");
  const [defaultValue, setDefaultValue] = useState("despesas");
  const [selectedDespesa, setSelectedDespesa] = useState<Despesa | null>(null);
  const [totalDespesas, setTotalDespesas] = useState<string>("0");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ordenarPorDataVencimento = (a: any, b: any) =>
    new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime();

  const fetchData = async (
    searchParam: string | null,
    receita: string | null
  ) => {
    setCarregando(true);
    try {
      const urlDespesa = searchParam
        ? `/despesa?despesaCode=${searchParam}`
        : "/despesa";

      const urlReceita = receita
        ? `/api/receita?receitaId=${receita}`
        : "/api/receita";
      const [
        despesasResponse,
        receitasResponse,
        salariosResponse,
        despesasMensaisResponse,
      ] = await Promise.all([
        api.get(urlDespesa),
        api.get(urlReceita),
        api.get("/despesaMensal"),
        api.get("/despesaMensal/despesamensal"),
      ]);
      const despesasData = despesasResponse.data.data || [];
      const receitasData = receitasResponse.data.data || [];
      const despesasMensais = despesasMensaisResponse.data.data || [];
      const salarios = salariosResponse.data.data;
      // Função para ordenar por data de vencimento

      const despesasOrdenadas = [...despesasData].sort(
        ordenarPorDataVencimento
      );
      const receitasOrdenadas = [...receitasData].sort(
        ordenarPorDataVencimento
      );
      // Atualiza o estado com as despesas e receitas
      setDespesas(despesasOrdenadas);
      calcularTotalDespesas(despesasData);
      setReceitas(receitasOrdenadas);
      setDespesasMensais(despesasMensais);
      setSalarios(salarios);
    } catch (error) {
      console.log("Erro ao tentar recuperar os dados", error);
    } finally {
      setCarregando(false);
    }
  };

  function verificarVencimento(date: string) {
    const diaAtual = new Date();
    const dataVericada = new Date(date);
    if (diaAtual >= dataVericada) {
      console.log("vencido");
      return true;
    }

    return false;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const codigo = searchParams.get("despesaCode");
    const receitaCode = searchParams.get("receita");
    if (codigo) {
      fetchData(codigo, null);
    } else if (receitaCode) {
      setDefaultValue("receitas");
      fetchData(null, receitaCode);
    } else {
      fetchData(null, null);
    }
  }, []);

  async function getByFiltersDespesas(e: React.FormEvent) {
    e.preventDefault();
    try {
      setCarregando(true);
      // Objeto com os parâmetros
      const params: Record<string, string> = {};

      if (mes) params["mes"] = mes;
      if (ano) params["ano"] = ano;
      if (statusFiltro) params["status"] = statusFiltro;
      // Constrói a query string com os parâmetros
      const queryString = new URLSearchParams(params).toString();

      // Faz a requisição com a query dinâmica
      const response = await api.get(`/despesa?${queryString}`);
      if (!response.data.isSucces) {
        toast("erro ao tentar buscar dados");
        return;
      }

      const despesasOrdenadas = [...response.data.data].sort(
        ordenarPorDataVencimento
      );

      setDespesas(despesasOrdenadas);
      calcularTotalDespesas(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.status === 401) {
          localStorage.removeItem("token");
        } else {
          toast.error("Erro ao tentar remover peca.");
        }
        console.error("Erro ao buscar viagens:", error);
      }
    } finally {
      setCarregando(false);
    }
  }

  async function getByFiltersReceitas(e: React.FormEvent) {
    e.preventDefault();
    try {
      setCarregando(true);
      // Objeto com os parâmetros
      const params: Record<string, string> = {};

      if (mes) params["mes"] = mes;
      if (ano) params["ano"] = ano;
      if (statusFiltro) params["status"] = statusFiltro;
      // Constrói a query string com os parâmetros
      const queryString = new URLSearchParams(params).toString();

      // Faz a requisição com a query dinâmica
      const response = await api.get(`/api/receita?${queryString}`);
      if (!response.data.isSucces) {
        toast("erro ao tentar buscar dados");
        return;
      }

      const receitasOrdenadas = [...response.data.data].sort(
        ordenarPorDataVencimento
      );

      setReceitas(receitasOrdenadas);

      console.log(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.status === 401) {
          localStorage.removeItem("token");
        } else {
          toast.error("Erro ao tentar remover peca.");
        }
        console.error("Erro ao buscar viagens:", error);
      }
    } finally {
      setCarregando(false);
    }
  }

  function calcularTotalDespesas(despesas: Despesa[]) {
    const hoje = new Date();
    const mesAtual = mes != "" ? mes : hoje.getMonth() + 1;
    const anoAtual = ano != "" ? ano : hoje.getFullYear();

    const totalDespesasAtualizadas = despesas.reduce((acc, despesa) => {
      const somaPagamentos = despesa.pagamentos
        .filter((pagamento) => {
          return (
            pagamento.dataPagamento.substring(0, 4) == anoAtual &&
            pagamento.dataPagamento.substring(6, 7) == mesAtual
          );
        })
        .reduce((acc, pagamento) => acc + pagamento.valorPago, 0);

      const somaBoletos = despesa.boletos
        .filter((boleto) => {
          if (!boleto.dataPagamento) return false;
          const dataPagamento = new Date(boleto.dataPagamento);
          return (
            dataPagamento.getMonth() === mesAtual &&
            dataPagamento.getFullYear() === anoAtual
          );
        })
        .reduce((acc, boleto) => acc + boleto.valor, 0);

      return acc + somaPagamentos + somaBoletos;
    }, 0);

    setTotalDespesas(
      totalDespesasAtualizadas.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      })
    );
  }

  return (
    <section className="bg-[#070180] px-4 py-6 md:pt-12 md:h-[800px]">
      <div className="h-[700px] md:w-[1400px] mx-auto rounded-md bg-white flex flex-col">
        <div className="bg-black w-full">
          <p className="font-bold text-white text-center">
            Visualizar Finanças
          </p>
        </div>
        <div className="flex md:h-screen p-10 overflow-y-scroll">
          <div className="mx-auto md:w-full">
            <Tabs value={defaultValue} className="flex flex-col">
              <TabsList className="gap-4">
                <TabsTrigger
                  value="despesas"
                  onClick={() => setDefaultValue("despesas")}
                  className="font-bold"
                >
                  Despesas
                </TabsTrigger>
                <TabsTrigger
                  value="mensais"
                  onClick={() => setDefaultValue("mensais")}
                  className="font-bold"
                >
                  Gastos Mensais
                </TabsTrigger>
                <TabsTrigger
                  value="receitas"
                  onClick={() => setDefaultValue("receitas")}
                  className="font-bold"
                >
                  Receitas
                </TabsTrigger>
              </TabsList>
              <TabsContent value="despesas">
                <div className="w-full flex justify-center md:justify-end mt-2 mb-2">
                  <AdicionarDespesa
                    despesas={despesas}
                    setDespesas={setDespesas}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-between mb-10 md:mb-0">
                  <form
                    className="flex flex-col md:flex-row gap-2 mb-[140px] md:mb-10 font-bold h-[60px]"
                    onSubmit={(e) => getByFiltersDespesas(e)}
                  >
                    <div className="md:flex gap-2">
                      <div>
                        <label htmlFor="inicio">Mês:</label>
                        <Input
                          type="number"
                          name="inicio"
                          value={mes}
                          onChange={(e) => setMes(e.target.value)}
                          className="w-[180px] md:w-[160px]"
                        />
                      </div>
                      <div>
                        <label htmlFor="final">Ano:</label>
                        <Input
                          type="number"
                          name="final"
                          value={ano}
                          onChange={(e) => setAno(e.target.value)}
                          className="w-[180px] md:w-[160px]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="status">Status:</label>
                      <select
                        name="status"
                        value={statusFiltro}
                        onChange={(e) => {
                          setStatusFiltro(e.target.value);
                        }}
                        className="w-[180px] md:w-[160px] border rounded-md px-2 py-2"
                      >
                        <option value="todas">Todas</option>
                        <option value="paga">Pagas</option>
                        <option value="pendente">Não Pagas</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-end h-full">
                        <Button
                          type="submit"
                          className="bg-blue-600 w-[182px] md:w-full"
                        >
                          <Search className="text-white" />
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>

                {carregando ? (
                  <div className="flex items-center justify-center">
                    <Image
                      src={loading}
                      alt="loading"
                      className="animate-spin"
                      width={50}
                    />
                  </div>
                ) : (
                  <div className="h-[300px] md:h-[100%] overflow-y-scroll scrollbar-hide mb-4 md:mb-8">
                    <Table>
                      <TableHeader className="border-b-2">
                        <TableRow>
                          <TableHead className="text-black font-bold text-center">
                            Data Compra
                          </TableHead>
                          <TableHead className="text-black font-bold text-center">
                            Vencimento
                          </TableHead>
                          <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                            Origem
                          </TableHead>
                          <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                            Centro de Custo
                          </TableHead>
                          <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                            Valor Parcial
                          </TableHead>
                          <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                            Valor Pendente
                          </TableHead>
                          <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                            Pago
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-center">
                        {despesas.map((despesa) => {
                          // Função para obter a data de vencimento correta
                          const getVencimento = (despesa: Despesa) => {
                            if (despesa.formaPagamento === "Boleto") {
                              const primeiroBoletoNaoPago =
                                despesa.boletos.find((boleto) => !boleto.pago);
                              return primeiroBoletoNaoPago
                                ? primeiroBoletoNaoPago.vencimento
                                : despesa.boletos[despesa.boletos.length - 1]
                                    .vencimento;
                            } else {
                              return despesa.vencimento;
                            }
                          };

                          const vencimento = getVencimento(despesa);

                          return (
                            <TableRow
                              key={despesa.id}
                              className="hover:bg-gray-200"
                            >
                              <TableCell>
                                {format(
                                  toZonedTime(
                                    parseISO(despesa.dataCompra),
                                    "UTC"
                                  ),
                                  "dd/MM/yyyy"
                                )}
                              </TableCell>
                              <TableCell>
                                {vencimento
                                  ? format(
                                      toZonedTime(parseISO(vencimento), "UTC"),
                                      "dd/MM/yyyy"
                                    )
                                  : ""}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {despesa.entidadeOrigem}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {despesa.centroCusto}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell font-bold">
                                {despesa.formaPagamento === "Boleto"
                                  ? despesa.boletos.reduce(
                                      (total, boleto) =>
                                        total +
                                        (boleto.pago ? boleto.valor : 0),
                                      0
                                    )
                                  : despesa.valorParcial}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell font-bold">
                                {despesa.valorTotal -
                                  (despesa.formaPagamento === "Boleto"
                                    ? despesa.boletos.reduce(
                                        (total, boleto) =>
                                          total +
                                          (boleto.pago ? boleto.valor : 0),
                                        0
                                      )
                                    : despesa.valorParcial)}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {despesa.pago ? (
                                  <Badge className="bg-green-600">Paga</Badge>
                                ) : (
                                  <Badge className="bg-red-600">Pendente</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    className="bg-transparent shadow-none hover:bg-white"
                                    onClick={() => {
                                      setSelectedDespesa(despesa);
                                    }}
                                  >
                                    <Image
                                      src={removeIcon}
                                      alt="Remover"
                                      className="w-6 md:w-6"
                                    />
                                  </Button>
                                  <DespesaPDF despesa={despesa} />
                                  <DialogInfo
                                    setDespesas={setDespesas}
                                    despesa={despesa}
                                    despesas={despesas}
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    {selectedDespesa && (
                      <RemoverDespesa
                        setDespesas={setDespesas}
                        despesa={selectedDespesa}
                        onClose={() => setSelectedDespesa(null)}
                      />
                    )}
                  </div>
                )}
                <span className="text-xl font-bold">
                  Total Pago neste mês:{" "}
                  <b className="text-red-600">{totalDespesas}</b>
                </span>
              </TabsContent>
              <TabsContent value="receitas">
                <div className="flex flex-col md:flex-row gap-2 md:gap-0 items-center justify-between mb-10 md:mb-0">
                  <form
                    className="flex flex-col md:flex-row gap-2 mb-[140px] md:mb-10 font-bold h-[60px]"
                    onSubmit={(e) => getByFiltersReceitas(e)}
                  >
                    <div className="md:flex">
                      <div>
                        <label htmlFor="inicio">Mês:</label>
                        <Input
                          type="number"
                          name="inicio"
                          value={mes}
                          onChange={(e) => setMes(e.target.value)}
                          className="w-[180px] md:w-[160px]"
                        />
                      </div>
                      <div>
                        <label htmlFor="final">Ano:</label>
                        <Input
                          type="number"
                          name="final"
                          value={ano}
                          onChange={(e) => setAno(e.target.value)}
                          className="w-[180px] md:w-[160px]"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <label htmlFor="status">Status:</label>
                      <select
                        name="status"
                        value={statusFiltro}
                        onChange={(e) => {
                          setStatusFiltro(e.target.value);
                        }}
                        className="w-[180px] md:w-[160px] border rounded-md px-2 py-2"
                      >
                        <option value="todas">Todas</option>
                        <option value="paga">Pagas</option>
                        <option value="pendente">Não Pagas</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex items-end h-full">
                        <Button
                          type="submit"
                          className="bg-blue-600 md:w-full w-[182px]"
                        >
                          <Search className="text-white" />
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
                {carregando ? (
                  <div className="flex items-center justify-center">
                    <Image
                      src={loading}
                      alt="loading"
                      className="animate-spin"
                      width={50}
                    />
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="border-b-2">
                      <TableRow>
                        <TableHead className="text-black font-bold text-center">
                          Vencimento
                        </TableHead>
                        <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                          Responsável
                        </TableHead>
                        <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                          Pago
                        </TableHead>
                        <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                          Valor Total
                        </TableHead>
                        <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                          Valor Parcial
                        </TableHead>
                        <TableHead className="text-black font-bold text-center hidden sm:table-cell">
                          Pendente
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-center">
                      {receitas.map((receita) => (
                        <TableRow
                          key={receita.id}
                          className="hover:bg-gray-200"
                        >
                          <TableCell
                            className={`font-bold ${
                              verificarVencimento(receita.vencimento) &&
                              "text-red-600 "
                            }`}
                          >
                            {format(
                              toZonedTime(parseISO(receita.vencimento), "UTC"),
                              "dd/MM/yyyy"
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {receita.viagem
                              ? receita.viagem.cliente?.nome
                              : "N/a"}
                          </TableCell>

                          <TableCell
                            className={`hidden sm:table-cell font-bold ${
                              receita.pago ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {receita.pago
                              ? "sim".toUpperCase()
                              : "não".toUpperCase()}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {receita.valorTotal}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {receita.valorPago}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {receita.valorTotal - receita.valorPago}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DialogRemoverReceita
                                receita={receita}
                                setReceitas={setReceitas}
                              />
                              <GeneratePDF receita={receita} />
                              <DialogInformacoesReceitas receita={receita} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              <TabsContent value="mensais">
                <div className="flex justify-end w-full">
                  <FinancialDialogs
                    setDespesas={setDespesasMensais}
                    despesas={despesasMensais}
                    salarios={salarios}
                    setSalarios={setSalarios}
                  />
                </div>
                <div className="flex flex-col md:flex-row md:justify-evenly mb-4 md:w-full gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold prose prose-lg">
                      Salários
                    </h2>
                    <div className="rounded-md border shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Responsável</TableHead>
                            <TableHead>Valor Salario</TableHead>
                            <TableHead className="hidden sm:table-cell">
                              Valor Vale
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                              A receber
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                              Dia do Salário
                            </TableHead>
                            <TableHead className="hidden sm:table-cell">
                              Dia do Vale
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salarios.map((salario) => (
                            <TableRow key={salario.id}>
                              <TableCell>
                                {salario.responsavel
                                  ? salario.responsavel.nome
                                  : ""}
                              </TableCell>
                              <TableCell>
                                {salario.valorTotal.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {salario.valorVale.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {(
                                  salario.valorTotal - salario.valorVale
                                ).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </TableCell>

                              <TableCell className="hidden sm:table-cell">
                                {salario.diaVale}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {salario.diaSalario}
                              </TableCell>

                              <TableCell className="flex gap-2">
                                <RemoverSalario
                                  salarios={salarios}
                                  setSalarios={setSalarios}
                                  id={salario.id}
                                />
                                <EditarSalario
                                  salarios={salarios}
                                  setSalarios={setSalarios}
                                  salario={salario}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold prose prose-lg">
                      Despesas Mensais
                    </h2>
                    <div className="rounded-md border shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data de Pagamento</TableHead>
                            <TableHead>Valor Total</TableHead>
                            <TableHead>Centro de Custo</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {despesasMensais.map((despesa) => (
                            <TableRow key={despesa.id}>
                              <TableCell>{despesa.diaPagamento}</TableCell>
                              <TableCell>
                                {despesa.valorTotal.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </TableCell>
                              <TableCell>{despesa.centroDeCusto}</TableCell>
                              <TableCell className="flex gap-2">
                                <RemoverDialog
                                  despesas={despesasMensais}
                                  setDespesas={setDespesasMensais}
                                  id={despesa.id}
                                />
                                <EditarDespesa
                                  setDespesas={setDespesasMensais}
                                  despesas={despesasMensais}
                                  despesa={despesa}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
                <span className="md:text-xl font-bold">
                  Valor total mensal:{" "}
                  {(
                    salarios.reduce(
                      (acc, salario) => acc + salario.valorTotal,
                      0
                    ) +
                    despesasMensais.reduce(
                      (acc, despesa) => acc + despesa.valorTotal,
                      0
                    )
                  ).toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
