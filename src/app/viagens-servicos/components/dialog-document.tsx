import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Viagem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import documentIcon from "../../assets/documentos.svg";
import { parseISO } from "date-fns";
import { format } from "date-fns-tz";

const logoUrl = "/Logo.png";

interface ViagemPDFProps {
  dadosViagens: Viagem | undefined;
}

const ViagemPDF: React.FC<ViagemPDFProps> = ({ dadosViagens }) => {
  const gerarPDF = async (): Promise<void> => {
    console.log(dadosViagens);
    const doc = new jsPDF();

    try {
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = 80;
      const imgHeight = 20;
      const x = (pageWidth - imgWidth) / 2;

      // Adicionar a imagem ao PDF
      doc.addImage(logoUrl, "PNG", x, 10, imgWidth, imgHeight);
      const dataAtual = format(new Date(), "dd/MM/yyyy HH:mm");

      doc.setFontSize(10);
      doc.text(`Data de emissão: ${dataAtual}`, pageWidth - 60, imgHeight + 15);

      doc.setFontSize(14);
      doc.text("Relatório de Viagem", pageWidth / 2, imgHeight + 20, {
        align: "center",
      });
      const dataHoraSaida = `${dadosViagens?.dataHorarioSaida.data ?? ""}T${
        dadosViagens?.dataHorarioSaida.hora ?? ""
      }`;
      const dataHoraRetorno = `${dadosViagens?.dataHorarioRetorno.data ?? ""}T${
        dadosViagens?.dataHorarioRetorno.hora ?? ""
      }`;

      const columns = ["Campo", "Valor"];
      const tableData = [
        ["Cliente", dadosViagens?.cliente?.nome ?? ""],
        [
          "Veículo Prefixo | Placa | Modelo",
          dadosViagens?.veiculo?.prefixo +
            " | " +
            dadosViagens?.veiculo?.placa.toUpperCase() +
            " | " +
            dadosViagens?.veiculo?.modelo,
        ],
        [
          "Motorista 1",
          dadosViagens?.motoristaViagens[0]
            ? dadosViagens.motoristaViagens[0].motorista?.nome
            : "",
        ],
        [
          "Motorista 2",
          dadosViagens?.motoristaViagens[1]
            ? dadosViagens.motoristaViagens[1].motorista?.nome
            : "",
        ],
        [
          "Data e Hora Saída",
          format(parseISO(dataHoraSaida), "dd/MM/yyyy HH:mm"),
        ],
        [
          "Cidade - UF saída",
          dadosViagens?.rota.saida.cidadeSaida +
            " - " +
            dadosViagens?.rota.saida.ufSaida,
        ],
        [
          "Data e Hora Retorno",
          format(parseISO(dataHoraRetorno), "dd/MM/yyyy HH:mm"),
        ],
        [
          "Cidade - UF retorno",
          dadosViagens?.rota.retorno.cidadeSaida +
            " - " +
            dadosViagens?.rota.retorno.ufSaida,
        ],
        ["Km Inicial", dadosViagens?.kmInicialVeiculo],
        ["Km Final", dadosViagens?.kmFinalVeiculo],
        ["Valor Adiantamento", dadosViagens?.adiantamento?.verba.toString()],
      ];

      const startY = imgHeight + 30;

      // Gerar a tabela no PDF com margem inferior adicional
      doc.autoTable(columns, tableData, {
        startY,
        margin: { bottom: 20 }, // Adiciona margem inferior à tabela
      });

      // Obter a posição final da tabela
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const finalY = (doc as any).lastAutoTable.finalY + 20; // Adiciona 20 unidades de espaço após a tabela

      const intinerario = `${dadosViagens?.itinerario}`;

      // Adicionar um campo de texto para o itinerário da viagem com o novo espaçamento
      doc.setFontSize(8);
      doc.text("Itinerário da Viagem:", 10, finalY);
      doc.setDrawColor(0);
      doc.setLineWidth(0.5);
      doc.rect(10, finalY + 2, pageWidth - 20, 20);
      doc.text(intinerario, 12, finalY + 10);

      // Adicionar linhas para preenchimento manual dos gastos com o novo espaçamento
      doc.text("Gastos da Viagem:", 10, finalY + 35);
      const lineHeight = 8;
      for (let i = 0; i < 5; i++) {
        doc.line(
          10,
          finalY + 40 + i * lineHeight,
          pageWidth - 10,
          finalY + 40 + i * lineHeight
        );
      }

      doc.save(`dadosViagens_${dadosViagens?.id}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
    }
  };

  return (
    <Button
      className="flex gap-2 bg-gray-400 hover:bg-gray-200"
      onClick={gerarPDF}
    >
      <Image src={documentIcon} alt="documento" className="w-6" />
      <span className="text-slate-900">Documento</span>
    </Button>
  );
};

export default ViagemPDF;
