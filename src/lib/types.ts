export interface Responsavel {
  id: number;
  nome: string;
  dataNascimento: string;
  telefone: string;
  documento: Documento;
  endereco: Endereco;
  cpf: string;
}

export interface Motorista extends Responsavel {
  habilitacao: Habilitacao;
  ferias?: Ferias[];
  dataAdmissao: string;
}

export interface Cliente extends Responsavel {
  tipo: string;
  email: string;
  nomeFantasia: string;
}

export interface Fornecedor extends Responsavel {
  tipo: string;
  nomeFantasia: string;
}

export interface Colaborador extends Responsavel {
  ferias: Ferias[];
  dataAdmissao: string;
}

export interface Viagem {
  id: number;
  rota: Rota;
  dataHorarioSaida: DataHorario;
  dataHorarioRetorno: DataHorario;
  dataHorarioSaidaGaragem: DataHorario;
  dataHorarioChegada: DataHorario;
  clienteId: number;
  tipoServico: string;
  status: string;
  tipoViagem: string;
  tipoPagamento: string;
  valorContratado: number;
  itinerario: string;
  veiculoId: number;
  motoristasId: number[];
  veiculo?: Veiculo;
  motoristaViagens: MotoristaViagem[];
  cliente?: Cliente;
  kmInicialVeiculo: number;
  kmFinalVeiculo: number;
  abastecimentos: Abastecimento[];
  adiantamento?: Adiantamento;
  totalDespesa: number;
  valorLiquidoViagem: number;
  receita?: IReceitas;
  createdAt?: string;
}

export interface MotoristaViagem {
  viagemId: number;
  viagem?: Viagem;
  motoristaId: number;
  motorista?: Motorista;
}

export type Endereco = {
  uf: string;
  cidade: string;
  rua: string;
  bairro: string;
  numero: string;
};

export type Habilitacao = {
  protocolo: string;
  vencimento: string;
  categoria: string;
  cidade: string;
  uf: string;
};

export type Documento = {
  documento: string;
  tipo: string;
};

export type FormField = {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
};

export type FormData = {
  nome: string;
  dataNascimento: string;
  telefone: string;
  documento: Documento;
  endereco: Endereco;
  cpf: string;
  habilitacao: Habilitacao;
};

export interface IDocumentos {
  id: string;
  vencimento: string;
  tipoDocumento: string;
  referencia: string;
  pendente: boolean;
}

export interface Manutencao {
  id: string;
  dataLancamento: string;
  dataPrevista: string;
  dataRealizada: string;
  tipo: string;
  tipoPagamento: string;
  servicoId: number;
  veiculoId: number;
  kmPrevista: number;
  kmAtual: number;
  kmRealizada: number;
  custo: number;
  veiculo?: Veiculo;
  servico?: Servico;
  realizada: boolean;
}

export type FormDataFornecedor = {
  nome: string;
  dataNascimento: string;
  telefone: string;
  documento: Documento;
  endereco: Endereco;
  cpf: string;
  tipo: string;
};

export type Veiculo = {
  id: string;
  prefixo: string;
  kmAtual: number;
  placa: string;
  marca: string;
  localEmplacado: string;
  uf: string;
  carroceria: string;
  capacidadeTank: number;
  ano: number;
  tipo: string;
  modelo: string;
  quantidadePoltronas: number;
  acessorios: string;
};

export interface Uf {
  id: number;
  sigla: string;
  nome: string;
}

export interface Cidade {
  id: number;
  nome: string;
}

export interface Rota {
  saida: {
    ufSaida: string;
    cidadeSaida: string;
    localDeSaida: string;
  };
  retorno: {
    ufSaida: string;
    cidadeSaida: string;
    localDeSaida: string;
  };
}

export interface DataHorario {
  data: string;
  hora: string;
}

interface HorarioLocal {
  data: string;
  hora: string;
  local: string;
}

export interface ViagemProgramda {
  id: number;
  titulo: string;
  descricao: string;
  saida: HorarioLocal;
  retorno: HorarioLocal;
  chegada: HorarioLocal;
  valorPassagem: number;
  valorPassagemIdaVolta: number;
  formaPagto: string;
  responsavel: string;
  guia: string;
  itinerario: string;
  observacoes: string;
  veiculoId: number;
  veiculo?: Veiculo;
  passagens: Passagem[];
  createdAt: string
}

export interface Ferias {
  id: number;
  responsavelId: number;
  responsavel?: Responsavel;
  inicioFerias: string;
  fimFerias: string;
}

export interface Peca {
  id: number;
  quantidade: number;
  nome: string;
  preco: number;
}

export interface RetiradaPeca {
  id: number;
  pecaId: number;
  peca?: Peca;
  veiculoId: number;
  veiculo?: Veiculo;
  quantidade: number;
  precoTotal: number;
  dataDeRetirada: string;
}

export interface AdicionarPeca {
  id: number;
  pecaId: number;
  peca?: Peca;
  quantidade: number;
  precoTotal: number;
  dataDeEntrada: string;
}

export interface Servico {
  id: string;
  nomeServico: string;
}

export interface Passagem {
  id?: number;
  viagemId: number;
  emailPassageiro: string;
  telefonePassageiro: string;
  cidadePassageiro: string;
  valorTotal: number;
  valorPersonalizado: number;
  paradaPassageiro: string;
  cpfPassageiro: string;
  nomePassageiro: string;
  dataEmissao: string; // ou Date, dependendo do uso no projeto
  formaPagamento: string;
  poltronaIda?: number;
  poltronaVolta?: number;
  situacao: string;
  tipo: string;
}

export interface DespesaMensal {
  id: number;
  diaPagamento: number;
  valorTotal: number;
  centroDeCusto: string;
}

export interface Salario {
  id: number;
  diaVale: number;
  diaSalario: number;
  valorTotal: number;
  valorVale: number;
  responsavelId: number;
  responsavel?: Responsavel;
}

export interface PagamentoDespesa {
  id: number;
  valorPago: number;
  despesaId: number;
  despesa: Despesa;
  dataPagamento: string;
}

// Interface para Boleto
export interface Boleto {
  id: number;
  referencia: string;
  dataEmissao: string;
  valor: number;
  juros: number;
  despesaId: number;
  despesa: Despesa;
  pago: boolean;
  vencimento: string;
  dataPagamento?: string;
}

// Interface para Despesa
export interface Despesa {
  id: number;
  dataCompra: string;
  entidadeOrigem: string;
  entidadeId: number;
  vencimento?: string;
  valorTotal: number;
  formaPagamento: string;
  pagamentos: PagamentoDespesa[];
  parcelas: number;
  boletos: Boleto[];
  centroCusto: string;
  descricao: string;
  valorParcial: number;
  pago: boolean;
  parcelasPagas: number;
  boletosPagos: boolean;
}

export interface IReceitas {
  id: string;
  dataCompra: string;
  origemPagamento: string;
  viagemId: number;
  viagem?: Viagem;
  vencimento: string;
  pago: boolean;
  valorTotal: number;
  valorPago: number;
  pagamentos: Pagamento[];
  formaPagamento: string;
  centroCusto: string;
}

export interface Pagamento {
  id: number;
  valorPago: number;
  receitaId: number;
  dataPagamento: string;
}

export interface Abastecimento {
  id: number;
  valorTotal: number;
  litros: number;
  origemPagamento: string;
  viagemId: number;
  viagem?: Viagem; // Referência ao objeto Viagem
  dataVencimento: string;
}

export interface Adiantamento {
  id: number;
  tipoVerba: string;
  verba: number;
  valorDeAcerto: number;
  diferenca: number; // Calculado como verba - valorDeAcerto
  descricao: string;
  viagemId: number;
  viagem?: Viagem; // Referência ao objeto Viagem
}

export interface Ferias {
  id: number;
  responsavelId: number;
  responsavel?: Responsavel;
  inicioFerias: string;
  fimFerias: string;
}

export interface ReceitasMensais {
  month: string;
  depesas: number;
  receitas: number;
  valorLiquido: number;
}
