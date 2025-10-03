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
import { api } from "@/lib/axios";

import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import loading from "@/app/assets/loading.svg";
import { useMutation, useQueryClient } from "@tanstack/react-query";




interface AdicionarProps {
  receitaId: number;

}

export function AdicionarPagamento({
  receitaId
}: AdicionarProps) {

  const [dataPagamento, setDataPagamento] = useState<string>();
  const [valorTotal, setValorTotal] = useState<number>(0);

  const queryClient = useQueryClient();
  const { mutate: createPagamento, isPending: isCreatingPagamento } = useMutation({
    mutationFn: async () => {
      const response = await api.post("/pagamento", {
        valorPago: valorTotal,
        dataPagamento: dataPagamento,
        receitaId: receitaId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viagemInfo"] });
      toast.success("Pagamento da viagem adicionado com sucesso");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });


  return (
    <>
      <Dialog>
        <DialogTrigger>
          <span className="rounded-md bg-green-600 p-2 text-white cursor-pointer absolute right-2 top-2">
            Adicionar Nova
          </span>
        </DialogTrigger>
        <DialogContent className="w-max h-max overflow-y-scroll">
          <DialogHeader>
            <DialogTitle>Novo Pagamento de Viagem</DialogTitle>
          </DialogHeader>
          <section>
            <form
              onSubmit={ (e) => {
                e.preventDefault();
                 createPagamento();
              }}
              className="p-2 flex gap-2 items-end w-full"
            >
              <div className="flex-1">
                <Label>Valor Pago</Label>
                <Input
                  type="number"
                  value={valorTotal}
                  onChange={(e) => setValorTotal(Number(e.target.value))}
                />
              </div>
              <div className="flex-1">
                <Label>Valor Pago</Label>
                <Input
                  type="date"
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                />
              </div>
              <Button className="bg-red-500">
                {isCreatingPagamento ? (
                  <Image
                    src={loading}
                    alt="carregando"
                    className="text-center animate-spin"
                  />
                ) : (
                  "Confirmar"
                )}
              </Button>
            </form>
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
}
