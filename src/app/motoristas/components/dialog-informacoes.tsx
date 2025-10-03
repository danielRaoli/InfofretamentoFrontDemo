"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useState } from "react";
import loading from "../../assets/loading-dark.svg";
import Image from "next/image";

interface Motorista {
  id: number;
  nome: string;
  cpf: string;
  cnh: string;
  telefone: string;
  email: string;
  status: string;
  endereco: {
    cidade: string;
    uf: string;
    rua: string;
    numero: string;
    bairro: string;
    cep: string;
  };
}

interface DialogInformacoesMotoristaProps {
  motoristaId: number;
  onClose: () => void;
}

export function DialogInformacoesMotorista({ motoristaId, onClose }: DialogInformacoesMotoristaProps) {
  const [open, setOpen] = useState(true);

  const { data: motorista, isLoading } = useQuery({
    queryKey: ["motorista", motoristaId],
    queryFn: async () => {
      const response = await api.get(`/motorista/${motoristaId}`);
      if (!response.data.isSucces) {
        throw new Error("Erro ao buscar informações do motorista");
      }
      return response.data.data as Motorista;
    }
  });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex justify-center p-4">
            <Image src={loading} alt="loading" className="animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!motorista) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Motorista não encontrado</DialogTitle>
          </DialogHeader>
          <p className="text-center">Não foi possível encontrar as informações deste motorista.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Informações do Motorista</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Nome</h3>
              <p>{motorista.nome}</p>
            </div>
            <div>
              <h3 className="font-semibold">CPF</h3>
              <p>{motorista.cpf}</p>
            </div>
            <div>
              <h3 className="font-semibold">CNH</h3>
              <p>{motorista.cnh}</p>
            </div>
            <div>
              <h3 className="font-semibold">Telefone</h3>
              <p>{motorista.telefone}</p>
            </div>
            <div>
              <h3 className="font-semibold">Email</h3>
              <p>{motorista.email}</p>
            </div>
            <div>
              <h3 className="font-semibold">Status</h3>
              <p>{motorista.status}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-2">Endereço</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Rua</h4>
                <p>{motorista.endereco.rua}</p>
              </div>
              <div>
                <h4 className="font-medium">Número</h4>
                <p>{motorista.endereco.numero}</p>
              </div>
              <div>
                <h4 className="font-medium">Bairro</h4>
                <p>{motorista.endereco.bairro}</p>
              </div>
              <div>
                <h4 className="font-medium">CEP</h4>
                <p>{motorista.endereco.cep}</p>
              </div>
              <div>
                <h4 className="font-medium">Cidade</h4>
                <p>{motorista.endereco.cidade}</p>
              </div>
              <div>
                <h4 className="font-medium">UF</h4>
                <p>{motorista.endereco.uf}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
