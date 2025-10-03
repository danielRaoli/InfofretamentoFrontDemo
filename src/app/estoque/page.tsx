"use client";
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
import { Peca, RetiradaPeca, AdicionarPeca } from "@/lib/types";
import { api } from "@/lib/axios";
import loading from "../assets/loading-dark.svg";
import axios from "axios";
import { useRouter } from "next/navigation";
import DialogEditarPeca from "../estoque/components/pecas/dialog-editar";
import DialogAdicionarPeca from "../estoque/components/pecas/dialog-adicionar";
import DialogRemoverPeca from "../estoque/components/pecas/dialog-remover";
import DialogAdicionarRetirada from "../estoque/components/retiradas/dialog-adicionar";
import DialogRemoverRetirada from "../estoque/components/retiradas/dialog-remover";
import DialogAdicionarReestoque from "../estoque/components/reestoque/dialog-adicionar";
import DialogRemoverReestoque from "../estoque/components/reestoque/dialog-remover";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function Financeiro() {
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [retiradas, setRetiradas] = useState<RetiradaPeca[]>([]);
  const [reestoques, setReestoques] = useState<AdicionarPeca[]>([]);
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFinal, setDataFinal] = useState<string>("");
  const [prefixoVeiculo, setPrefixoVeiculo] = useState<string>("");
  const [carregando, setCarregando] = useState(false);
  const [estoqueDesatualizado, setEstoqueDesatualizado] = useState(true);
  const router = useRouter();
  const fetchData = async () => {
    setCarregando(true);
    try {
      const [pecasResponse, retiradasResponse, reestoqueResponse] =
        await Promise.all([
          api.get("/peca"),
          api.get("/retirada"),
          api.get("/reestoque"),
        ]);
      const pecasData = pecasResponse.data.data || [];
      const retiradasData = retiradasResponse.data.data || [];
      const reestoqueData = reestoqueResponse.data.data || [];
      setPecas(pecasData);
      setRetiradas(retiradasData);
      setReestoques(reestoqueData);
    } catch (error) {
      if (axios.isAxiosError(error) && error.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
      }
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (estoqueDesatualizado) {
      fetchData();
      setEstoqueDesatualizado(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, estoqueDesatualizado]);

  async function getByFilters(e: React.FormEvent, tipo: string) {
    e.preventDefault();
    try {
      // Objeto com os parâmetros
      const params: Record<string, string> = {};
      if (dataInicio)
        params["minDate"] = new Date(dataInicio).toLocaleDateString();
      if (dataFinal) params["maxDate"] = dataFinal;
      if (prefixoVeiculo) params["prefixoVeiculo"] = prefixoVeiculo;
      // Constrói a query string com os parâmetros
      const queryString = new URLSearchParams(params).toString();
      // Faz a requisição com a query dinâmica
      const response = await api.get(`/${tipo}?${queryString}`);
      if (!response.data.isSucces) {
        toast("erro ao tentar consultar dados");
      }
      if (tipo === "retirada") setRetiradas(response.data.data);
      if (tipo === "reestoque") setReestoques(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
      } else {
        toast("Erro ao consultar dados");
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="bg-[#070180] px-4 py-6 md:pt-12 md:h-[800px]">
      <div className="h-[700px] md:w-[1400px] mx-auto rounded-md bg-white flex flex-col">
        <div className="bg-black w-full">
          <p className="font-bold text-white text-center">Visualizar Estoque</p>
        </div>
        <div className="flex md:h-screen p-10">
          <div className="mx-auto md:w-full">
            <Tabs defaultValue="pecas" className="flex flex-col">
              <TabsList className="gap-4">
                <TabsTrigger value="pecas" className="font-bold">
                  Peças
                </TabsTrigger>
                <TabsTrigger value="retirada" className="font-bold">
                  Retirada
                </TabsTrigger>
                <TabsTrigger value="reestoque" className="font-bold">
                  Reestoque
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pecas">
                <div className="flex items-center gap-2 justify-between mb-10">
                  <DialogAdicionarPeca pecas={pecas} setPecas={setPecas} />
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
                  <div className="h-[200px] overflow-y-scroll scrollbar-hide">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Peça</TableHead>
                          <TableHead>Preço</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Valor Total</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pecas.map((peca) => {
                          const valorTotalPeca = peca.preco * peca.quantidade;
                          return (
                            <TableRow key={peca.id}>
                              <TableCell>{peca.nome}</TableCell>
                              <TableCell>R${peca.preco.toFixed(2)}</TableCell>
                              <TableCell>{peca.quantidade}</TableCell>
                              <TableCell>
                                R${valorTotalPeca.toFixed(2)}
                              </TableCell>{" "}
                              <TableCell className="flex gap-2">
                                <DialogEditarPeca
                                  peca={peca}
                                  setPecas={setPecas}
                                  pecas={pecas}
                                />
                                <DialogRemoverPeca
                                  peca={peca}
                                  setPecas={setPecas}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    <div className="mt-4 text-left font-bold text-lg">
                      <p>
                        Valor total das peças: R$
                        {pecas
                          .reduce(
                            (acc, peca) => acc + peca.preco * peca.quantidade,
                            0
                          )
                          .toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="retirada">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10">
                  <form
                    className="flex gap-2"
                    onSubmit={(e) => getByFilters(e, "retirada")}
                  >
                    <div className="flex flex-col md:flex-row gap-2 mb-2">
                      <div className="flex flex-col">
                        <Label htmlFor="inicio">De:</Label>
                        <Input
                          type="date"
                          name="inicio"
                          value={dataInicio}
                          className="w-full"
                          onChange={(e) => setDataInicio(e.target.value)}
                        />
                      </div>
                      <div className="flex flex-col">
                        <Label htmlFor="final">Até:</Label>
                        <Input
                          type="date"
                          name="final"
                          value={dataFinal}
                          className="w-full"
                          onChange={(e) => setDataFinal(e.target.value)}
                        />
                      </div>
                    </div>
                    <Input
                      type="text"
                      value={prefixoVeiculo}
                      placeholder="Prefixo..."
                      onChange={(e) => setPrefixoVeiculo(e.target.value)}
                      className="mt-4"
                    />
                    <Button type="submit" className="bg-blue-600 mt-4">
                      <Search className="text-white" />
                    </Button>
                  </form>
                  <DialogAdicionarRetirada
                    setRetiradas={setRetiradas}
                    retiradas={retiradas}
                    setEstoqueDesatualizado={setEstoqueDesatualizado}
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Veiculo</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Peca
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Quantidade
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Preco Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {retiradas.map((retirada) => (
                      <TableRow key={retirada.id}>
                        <TableCell>
                          {new Date(retirada.dataDeRetirada).toLocaleDateString(
                            "pt-BR"
                          )}
                        </TableCell>
                        <TableCell>
                          {retirada.veiculo?.prefixo || "XXXX"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {retirada.peca?.nome || "peca"}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {retirada.quantidade}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          R${retirada.precoTotal}
                        </TableCell>
                        <TableCell>
                          <DialogRemoverRetirada
                            retirada={retirada}
                            setRetiradas={setRetiradas}
                            setEstoqueDesatualizado={setEstoqueDesatualizado}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="reestoque">
                <div className="flex flex-col md:flex-row items-center justify-between mb-10">
                  <form
                    className="flex flex-col md:flex-row gap-2 mb-4"
                    onSubmit={(e) => getByFilters(e, "reestoque")}
                  >
                    <div>
                      <Label htmlFor="inicio">De:</Label>
                      <Input
                        type="date"
                        name="inicio"
                        value={dataInicio}
                        className="w-full"
                        onChange={(e) => setDataInicio(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="final">Até:</Label>
                      <Input
                        type="date"
                        name="final"
                        value={dataFinal}
                        className="w-full"
                        onChange={(e) => setDataFinal(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="bg-blue-600 md:mt-6">
                      <Search className="text-white" />
                    </Button>
                  </form>
                  <DialogAdicionarReestoque
                    setReestoques={setReestoques}
                    reestoques={reestoques}
                    setEstoqueDesatualizado={setEstoqueDesatualizado}
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Peca</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Quantidade
                      </TableHead>
                      <TableHead>Valor Por Peça</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Preco Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reestoques.map((reestoque) => (
                      <TableRow key={reestoque.id}>
                        <TableCell>
                          {reestoque.dataDeEntrada
                            ? new Date(
                                reestoque.dataDeEntrada
                              ).toLocaleDateString("pt-BR")
                            : "Data não disponível"}
                        </TableCell>
                        <TableCell>{reestoque.peca?.nome || "peca"}</TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {reestoque.quantidade}
                        </TableCell>
                        <TableCell>
                          {reestoque.precoTotal /
                            (reestoque.peca?.quantidade ?? 1)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          R${reestoque.precoTotal}
                        </TableCell>
                        <TableCell>
                          <DialogRemoverReestoque
                            reestoque={reestoque}
                            setReestoques={setReestoques}
                            setEstoqueDesatualizado={setEstoqueDesatualizado}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </section>
  );
}
