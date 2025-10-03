"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import loading from "../../assets/loading.svg";
import Image from "next/image";

interface ExcluirProps {
  id: number;
  onClose: () => void;
}

export default function DialogExcluir({ id, onClose }: ExcluirProps) {
  const [open, setOpen] = useState(true);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.delete(`/viagem/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Viagem removida com sucesso");
      queryClient.invalidateQueries({ queryKey: ["viagens"] });
      handleClose();
    },
    onError: () => {
      toast.error("Erro ao tentar remover viagem");
    }
  });

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[350px] h-[150px] flex flex-col items-center">
        <DialogHeader className="mb-5">
          <DialogTitle className="font-black">
            Deseja remover está viagem?
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex items-center">
          <Button 
            className="bg-red-500" 
            onClick={() => mutate()}
            disabled={isPending}
          >
            {isPending ? (
              <Image
                src={loading}
                alt="carregando"
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
