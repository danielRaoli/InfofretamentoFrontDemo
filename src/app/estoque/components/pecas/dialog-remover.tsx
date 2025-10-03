"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Peca } from "@/lib/types";
import { useState } from "react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import removeIcon from "@/app/assets/remove.svg";
import loading from "@/app/assets/loading.svg";
import axios from "axios";
import { useRouter } from "next/navigation";

interface RemoveProps {
  peca: Peca;
  setPecas: React.Dispatch<React.SetStateAction<Peca[]>>;
}

export default function DialogRemover({ peca, setPecas }: RemoveProps) {
  const router = useRouter();
  const [removendo, setRemovendo] = useState(false);

  const handleRemoverDocumento = async (id: number) => {
    setRemovendo(true);
    try {
      const response = await api.delete(`/peca/${id}`);
      if (!response.data.isSucces) {
        toast("erro ao tentar excluir peca");
        return;
      }
      setPecas((prevPeca) => prevPeca.filter((d) => d.id !== id));
      toast.success("Despesa removida.", {
        className: "text-white font-semibold border-none shadow-lg",
        style: {
          borderRadius: "10px",
          padding: "16px",
        },
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
        } else {
          toast.error("Erro ao tentar remover peca.", {
            className: "text-white font-semibold border-none shadow-lg",
            style: {
              borderRadius: "10px",
              padding: "16px",
            },
          });
        }
      }
    } finally {
      setRemovendo(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="bg-transparent shadow-none p-0 hover:bg-transparent hover:scale-110 cursor-pointer transition-all">
          <Image src={removeIcon} alt="Remover" width={25} className="w-8" />
        </span>
      </DialogTrigger>
      <DialogContent className="w-[80%] md:w-[500px] md:h-[150px] flex flex-col items-center rounded-md">
        <DialogHeader className="mb-5">
          <DialogTitle className="font-black">
            Deseja remover a peça {peca.nome}?
          </DialogTitle>
          <p className="text-sm text-gray-500 font-medium text-center">
            Essa ação não poderá ser desfeita
          </p>
        </DialogHeader>
        <DialogFooter className="flex items-center">
          <Button
            className="bg-red-500"
            onClick={() => handleRemoverDocumento(peca.id)}
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