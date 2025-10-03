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
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { useState } from "react";
import loading from "../../assets/loading.svg";
import { useRouter } from "next/navigation";
import axios from "axios";

interface RemoverProps {
  viagemId: number;
 
}

export default function DialogRemover({ viagemId }: RemoverProps) {
  const [removendo, setRemovendo] = useState(false);
  const router = useRouter();

  const handleRemoverMotorista = async (id: number) => {
    setRemovendo(true);
    try {
      await api.delete(`/viagemprogramada/${id}`);
    
      toast.success("Viagem removida com sucesso.");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
        }
      }
      toast.error("Erro ao tentar remover viagem.");
      console.error("Erro ao remover viagem:", error);
    } finally {
      setRemovendo(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="bg-red-600 hover:bg-red-500 text-white rounded-md shadow-none px-2 py-1.5 text-center cursor-pointer transition-all">
          Remover
        </span>
      </DialogTrigger>
      <DialogContent className="w-auto md:w-[450px] h-auto rounded-md flex flex-col items-center">
        <DialogHeader className="mb-5">
          <DialogTitle className="font-black">
            Deseja remover o pacote de viagem?
          </DialogTitle>
          <p className="text-sm text-gray-500 font-medium text-center">
            Essa ação não poderá ser desfeita
          </p>
        </DialogHeader>
        <DialogFooter className="flex items-center">
          <Button
            className="bg-red-500"
            onClick={() => handleRemoverMotorista(viagemId)}
          >
            {removendo ? (
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
