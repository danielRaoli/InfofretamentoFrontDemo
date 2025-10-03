import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Despesa } from "@/lib/types";
import Image from "next/image";
import loading from "../../../assets/loading.svg";

interface DespesaRequest {
  descricao: string;
  valorTotal: number;
  formaPagamento: string;
  centroCusto: string;
  vencimento?: string | null;
  vencimentosBoleto: string[];
  parcelas: number;
  entidadeId: number;
  entidadeOrigem: string;
}

interface DespesaProps {
  setDespesas: React.Dispatch<React.SetStateAction<Despesa[]>>;
  despesas: Despesa[];
}

export function AdicionarDespesa({ setDespesas, despesas }: DespesaProps) {
  const [despesaRequest, setDespesaRequest] = useState<DespesaRequest>({
    descricao: "",
    valorTotal: 0,
    formaPagamento: "",
    centroCusto: "",
    vencimentosBoleto: [],
    vencimento: null,
    entidadeId: 0,
    entidadeOrigem: "",
    parcelas: 0,
  });

  const [adicionando, setAdicionando] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDespesaRequest((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSelectChange = (value: string, name: string) => {
    setDespesaRequest((prevState) => ({
      ...prevState,
      [name]: value,
      // Resetar parcelas e vencimentos quando a forma de pagamento mudar
      parcelas: value === "Boleto" ? prevState.parcelas : 0,
      vencimentosBoleto: value === "Boleto" ? prevState.vencimentosBoleto : [],
    }));
  };

  const handleParcelasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const novaQuantidadeParcelas = Number(e.target.value);
    if (novaQuantidadeParcelas <= 12) {
      setDespesaRequest((prevState) => ({
        ...prevState,
        parcelas: novaQuantidadeParcelas,
        vencimentos: Array(novaQuantidadeParcelas).fill(""), // Inicializa o array de vencimentos
      }));
    }
  };

  const handleVencimentoParcelaChange = (index: number, value: string) => {
    setDespesaRequest((prevState) => {
      const updatedVencimentos = [...prevState.vencimentosBoleto];
      updatedVencimentos[index] = value;
      return {
        ...prevState,
        vencimentosBoleto: updatedVencimentos,
      };
    });
  };

  async function handleSubmit() {
    try {
      setAdicionando(true);
      const response = await api.post("/despesa", despesaRequest);
      if (!response.data.isSucces) {
        toast("erro ao tentar registrar nova despesa");
      }

      setDespesas([...despesas, response.data.data]);
      toast.success("Despesa adicionada com sucesso!");
      console.log(response.data.data);
    } catch {
      toast.error("Erro ao tentar registrar nova despesa");
    } finally {
      setAdicionando(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <span className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-4 rounded">
          Adicionar Nova Despesa
        </span>
      </DialogTrigger>
      <DialogContent className="w-max h-max:[90%]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Despesa</DialogTitle>
        </DialogHeader>
        <fieldset>
          <legend>Informações</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Descrição</Label>
              <Input
                type="text"
                name="descricao"
                value={despesaRequest.descricao}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Valor Total</Label>
              <Input
                type="number"
                name="valorTotal"
                value={
                  despesaRequest.valorTotal ? despesaRequest.valorTotal : ""
                }
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Forma de Pagamento</Label>
              <Select
                value={despesaRequest.formaPagamento}
                onValueChange={(value) =>
                  handleSelectChange(value, "formaPagamento")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a forma de pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boleto">Boleto</SelectItem>
                  <SelectItem value="Pix">Pix</SelectItem>
                  <SelectItem value="Debito">Cartão Débito</SelectItem>
                  <SelectItem value="Credito">Cartão Crédito</SelectItem>
                  <SelectItem value="Transferencia">
                    Transferência Bancária
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Veículo</Label>
              <Input
                type="text"
                name="centroCusto"
                value={despesaRequest.centroCusto}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label>Entidade Origem</Label>
              <Input
                type="text"
                name="entidadeOrigem"
                value={despesaRequest.entidadeOrigem}
                onChange={handleInputChange}
              />
            </div>
            {despesaRequest.formaPagamento === "Boleto" ? (
              <div>
                <div className="flex flex-col">
                  <Label>Quantidade de Parcelas:</Label>
                  <Input
                    type="number"
                    name="parcelas"
                    value={despesaRequest.parcelas}
                    onChange={handleParcelasChange}
                    max={12}
                  />
                </div>
                {despesaRequest.parcelas > 0 && (
                  <div className="flex flex-col">
                    {Array.from(
                      { length: despesaRequest.parcelas },
                      (_, index) => (
                        <div key={index} className="flex flex-col">
                          <Label>Vencimento Parcela {index + 1}:</Label>
                          <Input
                            type="date"
                            value={
                              despesaRequest.vencimentosBoleto[index] || ""
                            }
                            onChange={(e) =>
                              handleVencimentoParcelaChange(
                                index,
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col">
                <Label>Vencimento do Pagamento:</Label>
                <Input
                  type="date"
                  name="vencimento"
                  value={despesaRequest.vencimento || ""}
                  onChange={handleInputChange}
                />
              </div>
            )}
          </div>
          <Button onClick={handleSubmit} className="mt-5">
            {adicionando ? (
              <Image
                src={loading}
                alt="carregando"
                className="text-center animate-spin"
              />
            ) : (
              "Salvar"
            )}
          </Button>
        </fieldset>
      </DialogContent>
    </Dialog>
  );
}
