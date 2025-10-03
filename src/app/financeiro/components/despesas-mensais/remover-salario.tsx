import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import removeIcon from "@/app/assets/remove.svg";
import Image from "next/image";
import { Salario } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import loadingIcon from "@/app/assets/loading.svg";
import { api } from "@/lib/axios";
import { toast } from "sonner";

interface RemoverSalario {
  setSalarios: React.Dispatch<React.SetStateAction<Salario[]>>;
  salarios: Salario[];
  id: number;
}

export function RemoverSalario({ setSalarios, salarios, id }: RemoverSalario) {
  const [loading, setLoading] = useState(false);

  async function remover() {
    try {
      setLoading(true);

      const response = await api.delete(`/despesamensal/${id}`);
      if (!response.data.isSucces) {
        toast(
          "Erro ao tentar remover, tente novamente ou entre em contato com a manutenção"
        );
        return;
      }

      const salariosAtualizados = salarios.filter((s) => s.id !== id);
      setSalarios(salariosAtualizados);
    } catch {
      toast(
        "Erro ao tentar remover, tente novamente ou entre em contato com a manutenção"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <span className="bg-transparent shadow-none p-0 hover:bg-transparent hover:scale-110 cursor-pointer transition-all">
            <Image src={removeIcon} alt="Remover" className="w-10 md:w-12" />
          </span>
        </DialogTrigger>
        <DialogContent className="w-[90%] md:w-[500px] rounded-md">
          <DialogHeader>
            <DialogTitle>
              Tem certeza que deseja remover estas informações ?
            </DialogTitle>
          </DialogHeader>
          <Button onClick={() => remover()} className="bg-red-600 text-white">
            {loading ? (
              <Image
                src={loadingIcon}
                alt="loading"
                className="text-center animate-spin"
              />
            ) : (
              "Confirmar"
            )}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
