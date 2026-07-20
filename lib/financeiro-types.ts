import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export interface Despesa {
  id: string;
  nome: string;
  valor: number;
  isFixa: boolean;
  mes: number;
  ano: number;
  categoria?: string;
  parcelado?: boolean;
  quantidadeMeses?: number;
  mesInicio?: number;
  anoInicio?: number;
  parcelaId?: string; // ID do gasto fixo parcelado
}

export interface Categoria {
  id: string;
  label: string;
  icon: string | keyof typeof MaterialIcons.glyphMap;
  customizada?: boolean;
}

export const CATEGORIAS_PADRAO: Categoria[] = [
  { id: "alimentacao", label: "Alimentação", icon: "restaurant" },
  { id: "transporte", label: "Transporte", icon: "directions-car" },
  { id: "saude", label: "Saúde", icon: "local-hospital" },
  { id: "educacao", label: "Educação", icon: "school" },
  { id: "diversao", label: "Diversão", icon: "sports-esports" },
  { id: "compras", label: "Compras", icon: "shopping-bag" },
  { id: "assinatura", label: "Assinatura", icon: "subscriptions" },
  { id: "utilidades", label: "Utilidades (Luz, Água, etc.)", icon: "lightbulb" },
  { id: "viagem", label: "Viagem", icon: "flight" },
  { id: "outra", label: "Outra", icon: "more-horiz" },
];

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const formatarMoeda = (valor: number): string => {
  // Formatar com ponto para milhares e vírgula para centavos (formato brasileiro)
  const formatted = valor.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `R$ ${formatted}`;
};
