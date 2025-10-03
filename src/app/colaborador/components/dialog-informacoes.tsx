import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import dadosViagemIcon from "@/app/assets/dadosviagem.svg";
import Image from "next/image";
import { Ferias, Motorista } from "@/lib/types";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CreditCard,
  FileText,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { parseISO } from "date-fns";
import { format, toZonedTime } from "date-fns-tz";
import loadingIcon from "@/app/assets/loading.svg";

interface ColaboradorProps {
  colaboradorId: number;
}

export default function DialogInformacoes({ colaboradorId }: ColaboradorProps) {
  const [colaborador, setColaborador] = useState<Motorista>();
  const [loading, setLoading] = useState(false);
  const [ferias, setFerias] = useState<Ferias>({
    id: 0,
    responsavel: colaborador,
    responsavelId: colaboradorId,
    inicioFerias: "",
    fimFerias: "",
  });

  const fetchColaborador = async () => {
    try {
      const response = await api.get(`/colaborador/${colaboradorId}`);
      setColaborador(response.data.data);
    } catch {
      toast(
        "Erro ao consultar dados, faça login novamente ou aguarde alguns minutos e tente novamente"
      );
    }
  };

  const verificarFeriasAtual = (feriasList: Ferias[]): boolean => {
    const dataAtual = new Date();
    return feriasList.some((ferias) => {
      const inicio = new Date(ferias.inicioFerias);
      const fim = new Date(ferias.fimFerias);
      return dataAtual >= inicio && dataAtual <= fim;
    });
  };

  useEffect(() => {
    if (!colaboradorId) return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchColaborador();
  }, [colaboradorId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post("/ferias", ferias);
      if (!response.data.isSucces) {
        toast("nao foi possivel fazer o registro");
      }
      setColaborador({
        ...colaborador!,
        ferias: colaborador?.ferias
          ? [...colaborador.ferias, ferias]
          : [ferias],
      });
    } catch {
      toast(
        "Erro ao tentar adicionar férias, tente novamente em alguns minutos"
      );
    } finally {
      setFerias({
        id: 0,
        responsavel: colaborador,
        responsavelId: colaboradorId,
        inicioFerias: "",
        fimFerias: "",
      });
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="bg-transparent shadow-none p-0 hover:bg-transparent hover:scale-110 cursor-pointer transition-all">
          <Image
            src={dadosViagemIcon}
            alt="documento"
            width={25}
            className="w-10 md:w-6"
          />
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] md:max-w-[600px] h-auto overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5" />
            {colaborador?.nome ?? "Carregando.."}
            {colaborador?.ferias ? (
              verificarFeriasAtual(colaborador.ferias) ? (
                <Badge className="bg-red-600">De Folga</Badge>
              ) : (
                <Badge className="bg-green-600">Trabalhando</Badge>
              )
            ) : (
              <Badge className="bg-green-600">Trabalhando</Badge>
            )}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[70vh] pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">
                Informações Pessoais
              </h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Data de Nascimento:{" "}
                    {colaborador
                      ? format(
                          toZonedTime(
                            parseISO(colaborador.dataNascimento),
                            "UTC"
                          ),
                          "dd/MM/yyyy"
                        )
                      : "Carregando.."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Telefone: {colaborador?.telefone ?? "Carregando.."}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>CPF: {colaborador?.cpf ?? "Carregando..."}</span>
                </div>
              </div>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold mb-3">Documento</h3>
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {colaborador?.documento.tipo.toUpperCase()}:{" "}
                    {colaborador?.documento.documento}
                  </span>
                </div>
              </div>
            </section>
            <Separator />
            <section>
              <h3 className="text-lg font-semibold mb-3">Endereço</h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p>
                      {colaborador?.endereco.rua},{" "}
                      {colaborador?.endereco.numero}
                    </p>
                    <p>{colaborador?.endereco.bairro}</p>
                    <p>
                      {colaborador?.endereco.cidade} -{" "}
                      {colaborador?.endereco.uf}
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <Separator />
            <section className="w-full">
              <h3 className="text-lg font-semibold mb-3">Férias</h3>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data Inicio</TableHead>
                      <TableHead>Data DataFinal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {colaborador?.ferias?.length ? (
                      colaborador?.ferias.map((feriasAtual) => (
                        <TableRow key={feriasAtual.id}>
                          <TableCell>
                            {format(
                              toZonedTime(
                                parseISO(feriasAtual.inicioFerias),
                                "UTC"
                              ),
                              "dd/MM/yyyy"
                            )}
                          </TableCell>
                          <TableCell>
                            {format(
                              toZonedTime(
                                parseISO(feriasAtual.fimFerias),
                                "UTC"
                              ),
                              "dd/MM/yyyy"
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="text-black">
                        <TableCell>Sem registros</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Card>
              <div className="w-full mt-4">
                <form
                  onSubmit={(e) => handleSubmit(e)}
                  className="w-full flex flex-col md:flex-row gap-2 md:items-end"
                >
                  <div>
                    <Label>Inicio Ferias</Label>
                    <Input
                      type="date"
                      value={ferias?.inicioFerias}
                      onChange={(e) =>
                        setFerias({ ...ferias, inicioFerias: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Fim Ferias</Label>
                    <Input
                      type="date"
                      value={ferias?.fimFerias}
                      onChange={(e) =>
                        setFerias({ ...ferias, fimFerias: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Button
                      disabled={loading}
                      type="submit"
                      className="bg-blue-600 w-full"
                    >
                      {loading ? (
                        <Image
                          src={loadingIcon}
                          alt="loading"
                          className="text-center animate-spin"
                        />
                      ) : (
                        "Registrar"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
