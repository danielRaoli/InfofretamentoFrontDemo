"use client";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import axios from "axios";
import { Cidade, Motorista, Uf } from "@/lib/types";
import loading from "../../assets/loading-dark.svg";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface DialogEditarMotoristaProps {
  motorista: Motorista | null;
  onClose: () => void;
}

export function DialogEditarMotorista({
  motorista,
  onClose,
}: DialogEditarMotoristaProps) {
  const [ufs, setUfs] = useState<Uf[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [motoristaAtualizar, setMotoristasAtualizar] = useState<Motorista | null>(motorista);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!motorista) return;

    axios
      .get<Uf[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
      .then((response) => {
        const sortedUfs = response.data.sort((a, b) =>
          a.nome.localeCompare(b.nome)
        );
        setUfs(sortedUfs);
      })
      .catch((error) => {
        console.error("Error fetching UFs:", error);
      });

    handleUfChange(motorista.endereco.uf);
  }, [motorista]);

  // Carrega as cidades com base na UF selecionada
  const handleUfChange = (uf: string) => {
    if (!motoristaAtualizar) return;

    setMotoristasAtualizar({
      ...motoristaAtualizar,
      endereco: { ...motoristaAtualizar.endereco, uf: uf },
    });

    axios
      .get<Cidade[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`
      )
      .then((response) => {
        const sortedCidades = response.data.sort((a, b) =>
          a.nome.localeCompare(b.nome)
        );
        setCidades(sortedCidades);
      })
      .catch((error) => {
        console.error("Error fetching cidades:", error);
      });
  };

  const { mutate: updateMotorista, isPending } = useMutation({
    mutationFn: async (data: Motorista) => {
      const response = await api.put(`/motorista/${data.id}`, data);
      if (!response.data.isSucces) {
        throw new Error("Erro ao atualizar motorista");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motoristas"] });
      toast.success("Motorista atualizado com sucesso");
     onClose();
    },
    onError: () => {
      toast.error("Erro ao atualizar motorista");
    }
  });


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motoristaAtualizar) return;
    updateMotorista(motoristaAtualizar);
  };

  if (!motoristaAtualizar) {
    return null;
  }

  return (
    <Dialog open={motorista !== null } onOpenChange={onClose}>
      <DialogContent className="md:w-auto md:h-[650px] h-[550px] overflow-y-scroll md:overflow-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Formulário</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col items-center"
        >
          <div className="flex flex-col md:flex-row h-screen md:h-[90%] overflow-y-scroll md:overflow-auto gap-10 items-start">
            <fieldset className="border p-4 rounded w-full h-full">
              <legend className="font-semibold">Cliente</legend>
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input
                  value={motoristaAtualizar.nome}
                  id="nome"
                  onChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      nome: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input
                  type="date"
                  value={motoristaAtualizar.dataNascimento}
                  id="dataNascimento"
                  onChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      dataNascimento: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="dataNascimento">Data de Admissao</Label>
                <Input
                  type="date"
                  value={motoristaAtualizar.dataAdmissao}
                  id="dataNascimento"
                  onChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      dataAdmissao: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={motoristaAtualizar.telefone}
                  onChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      telefone: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={motoristaAtualizar.cpf}
                  onChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      cpf: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="documento">Documento</Label>
                <Input
                  id="documento"
                  value={motoristaAtualizar.documento.documento}
                  onChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      documento: {
                        ...motoristaAtualizar.documento,
                        documento: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="tipoDocumento">Tipo de Documento</Label>
                <RadioGroup
                  value={motoristaAtualizar.documento.tipo}
                  onValueChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      documento: { ...motoristaAtualizar.documento, tipo: e },
                    })
                  }
                  className="flex"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="rg" id="rg" />
                    <label htmlFor="rg">RG</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cnh" id="cnh" />
                    <label htmlFor="cnh">CNH</label>
                  </div>
                </RadioGroup>
              </div>
            </fieldset>
            <fieldset className="border p-4 rounded w-full h-full">
              <legend className="font-semibold">Endereço</legend>
              <div className="">
                <Label htmlFor="uf">UF</Label>
                <select
                  id="uf"
                  value={motoristaAtualizar.endereco.uf}
                  onChange={(e) => handleUfChange(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Selecione a UF</option>
                  {ufs.map((uf) => (
                    <option key={uf.id} value={uf.sigla}>
                      {uf.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <Label htmlFor="cidade">Cidade</Label>
                <select
                  id="cidade"
                  value={motoristaAtualizar.endereco.cidade}
                  onChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      endereco: {
                        ...motoristaAtualizar.endereco,
                        cidade: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Selecione uma cidade</option>
                  {cidades.map((cidade) => (
                    <option key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </option>
                  ))}
                </select>
              </div>
              {[
                { label: "Rua", name: "rua" },
                { label: "Bairro", name: "bairro" },
                { label: "Número", name: "numero" },
              ].map(({ label, name }) => (
                <div key={name} className="mt-4">
                  <Label htmlFor={name}>{label}</Label>
                  <Input
                    id={name}
                    value={
                      motoristaAtualizar.endereco[
                        name as keyof typeof motoristaAtualizar.endereco
                      ] || ""
                    }
                    onChange={(e) =>
                      setMotoristasAtualizar({
                        ...motoristaAtualizar,
                        endereco: {
                          ...motoristaAtualizar.endereco,
                          [name]: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              ))}
            </fieldset>
            <fieldset className="border p-4 rounded w-full h-full">
              <legend className="font-semibold">Habilitação</legend>
              <div>
                <label htmlFor="protocolo">Protocolo</label>
                <Input
                  id="protocolo"
                  value={motoristaAtualizar.habilitacao.protocolo}
                  onChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      habilitacao: {
                        ...motoristaAtualizar.habilitacao,
                        protocolo: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="mt-4">
                <label htmlFor="vencimento">Vencimento</label>
                <Input
                  type="date"
                  id="vencimento"
                  value={motoristaAtualizar.habilitacao.vencimento}
                  onChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      habilitacao: {
                        ...motoristaAtualizar.habilitacao,
                        vencimento: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="mt-4">
                <label htmlFor="categoria">Categoria</label>
                <Input
                  id="categoria"
                  name="categoria"
                  placeholder="Digite a(s) categoria(s)..."
                  value={motoristaAtualizar.habilitacao.categoria}
                  onChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      habilitacao: {
                        ...motoristaAtualizar.habilitacao,
                        categoria: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div className="mt-4">
                <label htmlFor="ufHabilitacao">UF</label>
                <select
                  id="ufHabilitacao"
                  value={motoristaAtualizar.habilitacao.uf}
                  onChange={(e) =>
                          setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      habilitacao: {
                        ...motoristaAtualizar.habilitacao,
                        uf: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Selecione a UF</option>
                  {ufs.map((uf) => (
                    <option key={uf.id} value={uf.sigla}>
                      {uf.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4">
                <label htmlFor="cidade">Cidade</label>
                <select
                  id="cidade"
                  value={motoristaAtualizar.habilitacao.cidade}
                  onChange={(e) =>
                    setMotoristasAtualizar({
                      ...motoristaAtualizar,
                      habilitacao: {
                        ...motoristaAtualizar.habilitacao,
                        cidade: e.target.value,
                      },
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="">Selecione a Cidade</option>
                  {cidades.map((cidade) => (
                    <option key={cidade.id} value={cidade.nome}>
                      {cidade.nome}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>
          </div>
          <DialogFooter>
            <Button type="submit" className="w-[300px] mt-8" disabled={isPending}>
              {isPending ? (
                <Image
                  src={loading}
                  alt="loading"
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
