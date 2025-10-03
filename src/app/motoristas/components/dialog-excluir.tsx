"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Image from "next/image";
import loading from "../../assets/loading.svg";
interface DialogExcluirMotoristaProps {
  id: number | null;
  onClose: () => void;
}

export function DialogExcluirMotorista({
  id,
  onClose,
}: DialogExcluirMotoristaProps) {
  const queryClient = useQueryClient();

  const { mutate: deleteMotorista, isPending } = useMutation({
    mutationFn: async (id: number) => {
      const response = await api.delete(`/motorista/${id}`);
      if (!response.data.isSucces) {
        throw new Error("Erro ao excluir motorista");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["motoristas"] });
      toast.success("Motorista excluído com sucesso");
      onClose();
    },
    onError: () => {
      toast.error("Erro ao excluir motorista");
    },
  });

  return (
    <Dialog open={id !== null} onOpenChange={onClose}>
      <DialogContent className="w-[350px] h-[150px] rounded-md flex flex-col items-center">
        <DialogHeader className="mb-5">
          <DialogTitle className="font-black">
            Deseja remover o motorista?
          </DialogTitle>
          <p className="text-sm text-gray-500 font-medium text-center">
            Essa ação não poderá ser desfeita
          </p>
        </DialogHeader>
        <DialogFooter className="flex items-center">
          <Button
            className="bg-red-500"
            onClick={() => deleteMotorista(id ?? 0)}
          >
            {isPending ? (
              <Image
                src={loading}
                alt="removendo"
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
