"use client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { format, toZonedTime } from "date-fns-tz";
import { parseISO } from "date-fns";
import { Passagem } from "@/lib/types";
import { useState } from "react";

interface DialogDocumentoProps {
  viagemId: number;
  titulo: string;
  saida: {
    data: string;
  };
  retorno: {
    data: string;
  };
}

export function DialogDocumento({
  viagemId,
  titulo,
  saida,
  retorno,
}: DialogDocumentoProps) {
  const [loading, setLoading] = useState(false);

  const formatPassengerRow = (
    passenger: Passagem,
    includeReturnSeat: boolean
  ): string[] => {
    const baseInfo = [
      passenger.nomePassageiro || "Não informado",
      passenger.cidadePassageiro || "Não informado",
      passenger.cpfPassageiro.toString() || "Não informado",
      passenger.paradaPassageiro || "Não informado",
      passenger.poltronaIda?.toString() || "Sem poltrona",
      includeReturnSeat
        ? passenger.poltronaVolta?.toString() || "Sem poltrona"
        : "",
      "", // Aqui estamos garantindo que o campo "Fardo/Meio" sempre será vazio
      "",
      passenger.situacao || "Não informado",
    ];

    if (includeReturnSeat) {
      baseInfo.push(passenger.poltronaVolta?.toString() || "");
    }

    return baseInfo;
  };

  const bottomMargin = 10; // Defina o valor desejado para o espaçamento inferior

  const generatePDF = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/viagemProgramada/${viagemId}`);

      if (!response.data.isSucces) {
        toast.error("Erro ao buscar dados dos passageiros");
        return;
      }

      const passengers: Passagem[] = Array.isArray(
        response.data?.data?.passagens
      )
        ? response.data.data.passagens
        : [];

      console.log(passengers);
      console.log("Total de Passageiros:", passengers.length);

      // Separar passageiros por tipo de viagem e ordenar
      const oneWayPassengers = passengers
        .filter((p) => p.tipo.toUpperCase() === "IDA")
        .sort(
          (a, b) => (a.poltronaIda ?? Infinity) - (b.poltronaIda ?? Infinity)
        );
      const roundTripPassengers = passengers
        .filter((p) => p.tipo.toUpperCase() === "IDA-VOLTA")
        .sort(
          (a, b) => (a.poltronaIda ?? Infinity) - (b.poltronaIda ?? Infinity)
        );
      const returnOnOnlyPassengers = passengers
        .filter((p) => p.tipo.toUpperCase() === "VOLTA")
        .sort(
          (a, b) =>
            (a.poltronaVolta ?? Infinity) - (b.poltronaVolta ?? Infinity)
        );

      console.log("Passageiros IDA:", oneWayPassengers.length);
      console.log("Passageiros IDA-VOLTA:", roundTripPassengers.length);
      console.log("Passageiros VOLTA:", returnOnOnlyPassengers.length);

      const doc = new jsPDF();

      const roundTripColumns = [
        "Nome",
        "Cidade",
        "CPF",
        "Parada",
        "Poltrona (IDA)",
        "Poltrona (VOLTA)",
        "Fardo",
        "Meio",
        "Situação",
      ];

      const commonStyles = {
        fontSize: 8,
        cellPadding: 3,
      };

      const headerStyles = {
        fillColor: [7, 1, 128] as [number, number, number],
        textColor: [255, 255, 255] as [number, number, number],
        fontSize: 9,
        halign: "center" as const,
        font: "helvetica" as const,
      };

      const formatDate = (date?: string) => {
        if (!date) return "Data não informada";
        try {
          return format(toZonedTime(parseISO(date), "UTC"), "dd/MM/yyyy");
        } catch (error) {
          console.error("Erro ao formatar a data:", error);
          return "Data inválida";
        }
      };

      // Adicionar cabeçalho do documento
      doc.setFontSize(16);
      doc.text(`Lista de Passageiros - ${titulo}`, 14, 15);

      // Adicionar datas
      doc.setFontSize(10);
      doc.text(`Data de Saída: ${formatDate(saida?.data)}`, 14, 25);
      doc.text(`Data de Retorno: ${formatDate(retorno?.data)}`, 14, 30);
      doc.text(`Total de Passageiros: ${passengers.length}`, 14, 35);

      let currentY = 40;

      // Seção de passageiros somente IDA
      const returnOnlyWayColumns = [
        "Nome",
        "Cidade",
        "CPF",
        "Parada",
        "Poltrona (IDA)",
        "Fardo",
        "Meio",
        "Situação",
      ];

      const returnOnlyWayRows = oneWayPassengers.map((passengers) => [
        passengers.nomePassageiro || "Não informado",
        passengers.cidadePassageiro || "Não informado",
        passengers.cpfPassageiro.toString() || "Não informado",
        passengers.paradaPassageiro || "Não informado",
        passengers.poltronaIda?.toString() || "Não informado",
        "",
        "",
        passengers.situacao || "Não informado",
      ]);

      if (oneWayPassengers.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(7, 1, 128);
        doc.text(
          `Passageiros - Somente IDA (${oneWayPassengers.length})`,
          14,
          currentY
        );

        autoTable(doc, {
          head: [returnOnlyWayColumns],
          body: returnOnlyWayRows,
          startY: currentY + 5,
          theme: "grid",
          styles: commonStyles,
          headStyles: headerStyles,
          alternateRowStyles: {
            fillColor: [240, 240, 240] as [number, number, number],
          },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Seção de passageiros IDA E VOLTA
      if (roundTripPassengers.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(7, 1, 128);
        doc.text(
          `Passageiros - IDA E VOLTA (${roundTripPassengers.length})`,
          14,
          currentY
        );

        const roundTripRows = roundTripPassengers.map((passenger) =>
          formatPassengerRow(passenger, true)
        );

        autoTable(doc, {
          head: [roundTripColumns],
          body: roundTripRows,
          startY: currentY + 5,
          theme: "grid",
          styles: commonStyles,
          headStyles: headerStyles,
          alternateRowStyles: {
            fillColor: [240, 240, 240] as [number, number, number],
          },
        });

        // Atualiza o currentY para manter o espaçamento na parte inferior
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentY = (doc as any).lastAutoTable.finalY + bottomMargin;
      }

      const returnOnlyColumns = [
        "Nome",
        "Cidade",
        "CPF",
        "Parada",
        "Poltrona (VOLTA)",
        "Fardo",
        "Meio",
        "Situação",
      ];

      // SEÇÃO DE APENAS VOLTA
      if (returnOnOnlyPassengers.length > 0) {
        doc.setFontSize(12);
        doc.setTextColor(7, 1, 128);
        doc.text(
          `Passageiros - SOMENTE VOLTA (${returnOnOnlyPassengers.length})`,
          14,
          currentY + 10 // Ajustando o espaço para não sobrepor
        );

        const returnOnlyRows = returnOnOnlyPassengers.map((passenger) => [
          passenger.nomePassageiro || "Não informado",
          passenger.cidadePassageiro || "Não informado",
          passenger.cpfPassageiro.toString() || "Não informado",
          passenger.paradaPassageiro || "Não informado",
          passenger.poltronaVolta?.toString() || "Não informado",
          "",
          "",
          passenger.situacao || "Não informado",
        ]);

        autoTable(doc, {
          head: [returnOnlyColumns],
          body: returnOnlyRows,
          startY: currentY + 15, // Posicionando mais para baixo
          theme: "grid",
          styles: commonStyles,
          headStyles: headerStyles,
          alternateRowStyles: {
            fillColor: [240, 240, 240] as [number, number, number],
          },
        });

        // Atualizando o currentY após a tabela de "SOMENTE VOLTA"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Adicionar rodapé com totais
      doc.setFontSize(10);
      doc.setTextColor(0);

      // Salvar o PDF
      doc.save(
        `lista_passageiros_${titulo.toLowerCase().replace(/\s+/g, "_")}.pdf`
      );
    } catch (error) {
      toast.error("Erro ao gerar documento PDF");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      className="bg-blue-600 w-[150px] gap-2 hover:bg-blue-700"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        "Documento Viagem"
      )}
    </Button>
  );
}
