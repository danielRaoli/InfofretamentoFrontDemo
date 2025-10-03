import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { api } from "@/lib/axios";
import { Despesa } from "@/lib/types";
import loading from "@/app/assets/loading.svg";
import { useState } from "react";
import { toast } from "sonner";

interface DespesaProps {
  despesa: Despesa;
  setDespesas: React.Dispatch<React.SetStateAction<Despesa[]>>;
  onClose: () => void;
}

export default function RemoverDespesa({
  despesa,
  setDespesas,
  onClose,
}: DespesaProps) {
  const [removendo, setRemovendo] = useState(false);
  const handleRemoverManutencao = async (id: number) => {
    setRemovendo(true);
    try {
      if(despesa.entidadeOrigem == "Estoque" || despesa.entidadeOrigem == "Manutencao"){
        toast("Não é possivel remover uma despesa de estoque ou manutencao, remova diretamente o estoque ou a manutenção que a despesa será removida");
      
        return;}
      await api.delete(`/despesa/${id}`);
      setDespesas((prevDespesas) =>
        prevDespesas.filter((m) => m.id !== id)
      );
      toast.success("despesa removida.");
      onClose();
    } catch (error) {
      toast.error("Erro ao tentar remover despesa.");
      console.error("Erro ao remover despesa:", error);
      onClose();
    } finally {
      setRemovendo(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="md:w-[450px] w-[80%] md:h-auto flex flex-col items-center rounded-md">
        <DialogHeader className="mb-5">
          <DialogClose>
            <Button
              className="absolute right-2 bg-white text-black z-20 top-2"
              onClick={() => onClose()}
            >
              X
            </Button>
          </DialogClose>
          <DialogTitle className="font-black">
            Deseja remover a despesa?
          </DialogTitle>
          <p className="text-sm text-gray-500 font-medium text-center">
            Essa ação não poderá ser desfeita
          </p>
        </DialogHeader>
        <DialogFooter className="flex items-center">
          <Button
            className="bg-red-500"
            onClick={() => handleRemoverManutencao(despesa.id)}
          >
            {removendo ? (
              <Image
                src={loading}
                alt="loading"
                className="text-center animate-spin"
              />
            ) : (
              "Confirmar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
