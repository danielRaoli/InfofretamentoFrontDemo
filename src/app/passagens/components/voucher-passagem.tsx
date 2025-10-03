import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Passagem } from "@/lib/types";
import { parseISO } from "date-fns";
import { format } from "date-fns-tz";

const logo = "/Logo.png";

interface VoucherPassagemProps {
  passagem: Passagem;
}

export default function VoucherPassagem({ passagem }: VoucherPassagemProps) {
  const gerarVoucher = () => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const imgWidth = 40;
    const imgHeight = 15;
    const marginTop = 15;

    const title = "Voucher da Passagem";
    doc.setFont("courier", "normal");
    doc.setFontSize(18);

    // Definir posições para alinhar a logomarca à esquerda e o título à direita
    const imgX = 20; // Margem esquerda fixa para a logo
    const titleX = pageWidth / 2; // Centralizar horizontalmente o título na página

    // Adicionar a logomarca
    doc.addImage(logo, "PNG", imgX, marginTop, imgWidth, imgHeight);

    // Adicionar o título (alinhado à direita da logomarca)
    doc.text(title, titleX, marginTop + imgHeight / 2, { align: "center" });

    // Definir espaçamento entre o cabeçalho e a tabela
    const startY = marginTop + imgHeight + 10;

    const dataFormatada = passagem.dataEmissao
      ? format(parseISO(passagem.dataEmissao), "dd/MM/yyyy")
      : "Data inválida";

    // Dados da passagem
    const dados = [
      ["Nome", passagem.nomePassageiro],
      [
        "Poltrona IDA",
        passagem.poltronaIda ? passagem.poltronaIda : "Apenas volta",
      ],
      [
        "Poltrona VOLTA",
        passagem.poltronaVolta ? passagem.poltronaVolta : "Apenas ida",
      ],
      ["Data de Emissão", dataFormatada],
    ];

    // Criando a tabela
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (doc as any).autoTable({
      head: [["Campo", "Valor"]],
      body: dados,
      startY,
    });

    // Baixar o PDF
    doc.save(`Voucher_${passagem.nomePassageiro}.pdf`);
  };

  return (
    <Button onClick={gerarVoucher}>
      <Tag />
      Voucher
    </Button>
  );
}
