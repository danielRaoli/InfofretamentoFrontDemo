import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/axios";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import loading from "@/app/assets/loading.svg";
import { useMutation, useQueryClient } from "@tanstack/react-query";



interface AdicionarProps {
  viagemId: number;
}

export function AdicionarDespesa({
  viagemId
}: AdicionarProps) {
  const [tipoPagamento, setTipoPagamento] = useState<string>("");
  const [vencimentos, setVencimentos] = useState<string[]>([]);
  const [vencimentoPagamento, setVencimentoPagamento] = useState<string>("");
  const [valorTotal, setValorTotal] = useState<number>(0);
  const [parcelas, setParcelas] = useState<number>(0);
  const [centroCusto, setCentroCusto] = useState<string>("");
  const [descricao, setDescricao] = useState<string>("");

  const queryClient = useQueryClient();
  const { mutate: registrarDespesa, isPending } = useMutation({
    mutationFn: async () => {
      await api.post("/despesa", {
        formaPagamento: tipoPagamento,
        vencimento: vencimentoPagamento != "" ? vencimentoPagamento : null,
        vencimentosBoleto: vencimentos,
        valorTotal: valorTotal,
        entidadeId: viagemId,
        entidadeOrigem: "Viagem",
        centroCusto: centroCusto,
        parcelas: parcelas,
        descricao: descricao,
      });
    },
    onSuccess: () => {
      toast("despesa registrada com sucesso");
      queryClient.invalidateQueries({ queryKey: ["viagemInfo"] });
    },
    onError: () => {
      toast("erro ao tentar registrar nova despesa");
    },
  });

  return (
    <>
      <Dialog>
        <DialogTrigger>
          <span className="rounded-md bg-green-600 p-2 text-white cursor-pointer absolute right-2 top-2">
            Adicionar Nova
          </span>
        </DialogTrigger>
        <DialogContent className="w-max h-[80%] overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Nova Despesa de Viagem</DialogTitle>
          </DialogHeader>
          <fieldset className="border p-4 flex-1 rounded w-auto">
            <legend className="font-bold text-lg">
              Informações da Despesa
            </legend>
            <div className="grid grid-cols-2 gap-4 w-auto justify-center">
              <div>
                <Label>Valor Total</Label>
                <Input
                  value={valorTotal}
                  onChange={(e) => setValorTotal(Number(e.target.value))}
                  type="number"
                  placeholder="00,00R$"
                />
              </div>
              <div>
                <Label>Centro de custo</Label>
                <Input
                  value={centroCusto}
                  onChange={(e) => setCentroCusto(e.target.value)}
                  type="text"
                  placeholder="ex: estacionamento..."
                />
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  type="text"
                  placeholder="ex: estacionamento..."
                />
              </div>

              <div>
                <label htmlFor="tipo">Tipo do pagamento:</label>
                <Select
                  name="tipo"
                  value={tipoPagamento}
                  onValueChange={(value) => {
                    setTipoPagamento(value);
                    setVencimentos([]);
                    setVencimentoPagamento("");
                    setParcelas(0);
                  }}
                >
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipos</SelectLabel>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Pix">Pix</SelectItem>
                      <SelectItem value="Credito">Credito</SelectItem>
                      <SelectItem value="Debito">Debito</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {tipoPagamento === "Boleto" ? (
                <div>
                  <div className="flex flex-col">
                    <label htmlFor="parcelas">Quantidade de Parcelas:</label>
                    <Input
                      type="number"
                      name="parcelas"
                      className="border-2 font-medium w-[250px]"
                      max={12}
                      value={parcelas}
                      onChange={(e) => {
                        const novaQuantidadeParcelas = Number(e.target.value);
                        if (novaQuantidadeParcelas <= 12) {
                          setParcelas(novaQuantidadeParcelas);

                          // Redefinir os vencimentos de acordo com a nova quantidade de parcelas
                          setVencimentos(
                            Array(novaQuantidadeParcelas).fill("")
                          );
                        }
                      }}
                    />
                  </div>

                  {/* Lógica para gerar os campos de vencimento das parcelas */}
                  {parcelas > 0 && (
                    <div className="flex flex-col">
                      <label htmlFor="vencimentoParcelas">
                        Vencimentos das Parcelas:
                      </label>
                      {Array.from({ length: parcelas }, (_, index) => (
                        <div key={index} className="flex flex-col">
                          <label htmlFor={`vencimento${index + 1}`}>
                            Vencimento Parcela {index + 1}:
                          </label>
                          <Input
                            type="date"
                            name={`vencimento${index + 1}`}
                            className="border-2 font-medium w-[250px]"
                            value={vencimentos[index] || ""}
                            onChange={(e) =>
                              setVencimentos((prevVencimentos) => {
                                const updatedVencimentos = [...prevVencimentos];
                                updatedVencimentos[index] = e.target.value;
                                return updatedVencimentos;
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col">
                  <label htmlFor="dataRealizada">
                    Vencimento do Pagamento:
                  </label>
                  <Input
                    type="date"
                    name="dataRealizada"
                    className="border-2 font-medium w-[250px]"
                    value={vencimentoPagamento ?? ""}
                    onChange={(e) => setVencimentoPagamento(e.target.value)}
                  />
                </div>
              )}
              <Button
                type="submit"
                onClick={() => registrarDespesa()}
                className="mt-6"
              >
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
            </div>
          </fieldset>
        </DialogContent>
      </Dialog>
    </>
  );
}
