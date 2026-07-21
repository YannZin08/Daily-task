import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";
import { CATEGORIAS_PADRAO, Categoria, Despesa } from "@/lib/financeiro-types";
import { useSettings } from "@/lib/settings-provider";
import type { TranslationKey } from "@/lib/i18n/translations";

const FINANCEIRO_KEY = "financeiroDados";
const CATEGORIAS_KEY = "categoriasCustomizadas";

const CATEGORIA_TRANSLATION_KEYS: Record<string, TranslationKey> = {
  alimentacao: "categories.alimentacao",
  transporte: "categories.transporte",
  saude: "categories.saude",
  educacao: "categories.educacao",
  diversao: "categories.diversao",
  compras: "categories.compras",
  assinatura: "categories.assinatura",
  utilidades: "categories.utilidades",
  viagem: "categories.viagem",
  outra: "categories.outra",
};

export function useFinanceiro() {
  const { t } = useSettings();
  const [salario, setSalario] = useState("");
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [categoriasCustomizadas, setCategoriasCustomizadas] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Categorias padrão traduzidas conforme o idioma atual + customizadas do usuário
  // (o label das customizadas fica como o usuário digitou, sem tradução automática)
  const categorias = useMemo<Categoria[]>(() => {
    const padraoTraduzidas = CATEGORIAS_PADRAO.map((cat) => ({
      ...cat,
      label: t(CATEGORIA_TRANSLATION_KEYS[cat.id] ?? "categories.outra"),
    }));
    return [...padraoTraduzidas, ...categoriasCustomizadas];
  }, [categoriasCustomizadas, t]);

  const hoje = new Date();
  const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());

  const carregarDados = useCallback(async () => {
    try {
      const dados = await AsyncStorage.getItem(FINANCEIRO_KEY);
      if (dados) {
        const parsed = JSON.parse(dados);
        setSalario(parsed.salario || "");
        setDespesas(parsed.despesas || []);
        if (parsed.mesSelecionado) setMesSelecionado(parsed.mesSelecionado);
        if (parsed.anoSelecionado) setAnoSelecionado(parsed.anoSelecionado);
      } else {
        // Dados podem ter sido apagados (ex: "Limpar Dados" nas Configurações)
        setSalario("");
        setDespesas([]);
      }

      const categoriasData = await AsyncStorage.getItem(CATEGORIAS_KEY);
      setCategoriasCustomizadas(categoriasData ? JSON.parse(categoriasData) : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      // Só a primeira carga mostra o indicador; recargas em foco ficam silenciosas
      setIsLoading(false);
    }
  }, []);

  // Recarrega sempre que a aba ganha foco — mantém a tela em dia se os
  // dados mudarem em outro lugar (ex: "Limpar Dados" nas Configurações)
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  const salvarDados = async (novasDespesas: Despesa[], mes?: number, ano?: number, novoSalario?: string) => {
    try {
      await AsyncStorage.setItem(
        FINANCEIRO_KEY,
        JSON.stringify({
          salario: novoSalario !== undefined ? novoSalario : salario,
          despesas: novasDespesas,
          mesSelecionado: mes !== undefined ? mes : mesSelecionado,
          anoSelecionado: ano !== undefined ? ano : anoSelecionado,
        })
      );
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  };

  const atualizarSalario = (texto: string) => {
    setSalario(texto);
    salvarDados(despesas, undefined, undefined, texto);
  };

  const adicionarCategoriaCustomizada = async (nome: string) => {
    if (!nome.trim()) {
      Alert.alert(t("common.error"), t("financeiroModal.customCategoryError"));
      return null;
    }

    const novaCategoria: Categoria = {
      id: `custom-${Date.now()}`,
      label: nome.trim(),
      icon: "more-horiz",
      customizada: true,
    };

    const novasCategoriasCustomizadas = [...categoriasCustomizadas, novaCategoria];
    setCategoriasCustomizadas(novasCategoriasCustomizadas);

    await AsyncStorage.setItem(CATEGORIAS_KEY, JSON.stringify(novasCategoriasCustomizadas));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return novaCategoria;
  };

  // categoria recebido aqui é o id (ex.: "alimentacao" ou "custom-172...")
  const adicionarDespesa = (nome: string, valor: string, categoria: string | null) => {
    if (!nome.trim() || !valor.trim() || parseFloat(valor) <= 0) {
      Alert.alert(t("common.error"), t("financeiroAlert.expenseInvalid"));
      return false;
    }
    if (!categoria) {
      Alert.alert(t("common.error"), t("financeiroAlert.selectCategory"));
      return false;
    }

    const novaDespesa: Despesa = {
      id: Date.now().toString(),
      nome,
      valor: parseFloat(valor),
      isFixa: false,
      mes: mesSelecionado,
      ano: anoSelecionado,
      categoria,
    };

    const novasDespesas = [...despesas, novaDespesa];
    setDespesas(novasDespesas);
    salvarDados(novasDespesas);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true;
  };

  const editarDespesa = (id: string, nome: string, valor: string) => {
    const despesasEditadas = despesas.map((d) =>
      d.id === id
        ? { ...d, nome: nome || d.nome, valor: valor ? parseFloat(valor) : d.valor }
        : d
    );
    setDespesas(despesasEditadas);
    salvarDados(despesasEditadas);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deletarDespesa = (id: string) => {
    Alert.alert(t("financeiroAlert.deleteExpenseTitle"), t("financeiroAlert.deleteExpenseMessage"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: () => {
          const novasDespesas = despesas.filter((d) => d.id !== id);
          setDespesas(novasDespesas);
          salvarDados(novasDespesas);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const adicionarGastoFixo = (
    nome: string,
    valor: string,
    categoria: string | null,
    quantidadeMeses: string
  ) => {
    if (!nome.trim() || !valor.trim() || parseFloat(valor) <= 0) {
      Alert.alert(t("common.error"), t("financeiroAlert.fixedInvalid"));
      return false;
    }

    const mesesParcelar = parseInt(quantidadeMeses, 10) || 1;
    const parcelaId = Date.now().toString();
    const novasDespesas: Despesa[] = [];

    for (let i = 0; i < mesesParcelar; i++) {
      const mes = ((mesSelecionado - 1 + i) % 12) + 1;
      const ano = anoSelecionado + Math.floor((mesSelecionado - 1 + i) / 12);

      novasDespesas.push({
        id: `${parcelaId}-${i}`,
        nome,
        valor: parseFloat(valor),
        isFixa: true,
        mes,
        ano,
        categoria: categoria || "outra",
        parcelado: mesesParcelar > 1,
        quantidadeMeses: mesesParcelar,
        mesInicio: mesSelecionado,
        anoInicio: anoSelecionado,
        parcelaId,
      });
    }

    const todasDespesas = [...despesas, ...novasDespesas];
    setDespesas(todasDespesas);
    salvarDados(todasDespesas);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    return true;
  };

  const editarGastoFixo = (id: string, nome: string, valor: string, categoria: string | null) => {
    const despesasEditadas = despesas.map((d) =>
      d.id === id && d.mes === mesSelecionado && d.ano === anoSelecionado
        ? {
            ...d,
            nome: nome || d.nome,
            valor: valor ? parseFloat(valor) : d.valor,
            categoria: categoria || d.categoria || "outra",
          }
        : d
    );
    setDespesas(despesasEditadas);
    salvarDados(despesasEditadas);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const proximoMes = () => {
    if (mesSelecionado === 12) {
      setMesSelecionado(1);
      setAnoSelecionado(anoSelecionado + 1);
      salvarDados(despesas, 1, anoSelecionado + 1);
    } else {
      setMesSelecionado(mesSelecionado + 1);
      salvarDados(despesas, mesSelecionado + 1, anoSelecionado);
    }
  };

  const mesAnterior = () => {
    if (mesSelecionado === 1) {
      setMesSelecionado(12);
      setAnoSelecionado(anoSelecionado - 1);
      salvarDados(despesas, 12, anoSelecionado - 1);
    } else {
      setMesSelecionado(mesSelecionado - 1);
      salvarDados(despesas, mesSelecionado - 1, anoSelecionado);
    }
  };

  const despesasDoMes = despesas.filter((d) => d.mes === mesSelecionado && d.ano === anoSelecionado);
  const totalGastos = despesasDoMes.reduce((sum, d) => sum + d.valor, 0);
  const totalFixos = despesasDoMes.filter((d) => d.isFixa).reduce((sum, d) => sum + d.valor, 0);
  const totalVariaveis = totalGastos - totalFixos;
  const saldoDisponivel = (parseFloat(salario) || 0) - totalGastos;

  return {
    salario,
    atualizarSalario,
    despesas,
    despesasDoMes,
    categorias,
    isLoading,
    mesSelecionado,
    anoSelecionado,
    proximoMes,
    mesAnterior,
    totalGastos,
    totalFixos,
    totalVariaveis,
    saldoDisponivel,
    adicionarCategoriaCustomizada,
    adicionarDespesa,
    editarDespesa,
    deletarDespesa,
    adicionarGastoFixo,
    editarGastoFixo,
  };
}
