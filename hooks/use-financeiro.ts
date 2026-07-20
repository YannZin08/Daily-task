import { useCallback, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";
import { CATEGORIAS_PADRAO, Categoria, Despesa } from "@/lib/financeiro-types";

const FINANCEIRO_KEY = "financeiroDados";
const CATEGORIAS_KEY = "categoriasCustomizadas";

export function useFinanceiro() {
  const [salario, setSalario] = useState("");
  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>(CATEGORIAS_PADRAO);
  const [isLoading, setIsLoading] = useState(true);

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
      if (categoriasData) {
        const categoriasCustomizadas = JSON.parse(categoriasData);
        setCategorias([...CATEGORIAS_PADRAO, ...categoriasCustomizadas]);
      } else {
        setCategorias(CATEGORIAS_PADRAO);
      }
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
      Alert.alert("Erro", "Digite o nome da categoria");
      return;
    }

    const novaCategoria: Categoria = {
      id: `custom-${Date.now()}`,
      label: nome.trim(),
      icon: "more-horiz",
      customizada: true,
    };

    const novasCategorias = [...categorias, novaCategoria];
    setCategorias(novasCategorias);

    const categoriasCustomizadas = novasCategorias.filter((c) => c.customizada);
    await AsyncStorage.setItem(CATEGORIAS_KEY, JSON.stringify(categoriasCustomizadas));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const adicionarDespesa = (nome: string, valor: string, categoria: string | null) => {
    if (!nome.trim() || !valor.trim() || parseFloat(valor) <= 0) {
      Alert.alert("Erro", "Preencha corretamente a despesa");
      return false;
    }
    if (!categoria) {
      Alert.alert("Erro", "Selecione uma categoria");
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
    Alert.alert("Excluir Despesa", "Tem certeza que deseja excluir esta despesa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
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
      Alert.alert("Erro", "Preencha corretamente o gasto fixo");
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
        categoria: categoria || "outros",
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
            categoria: categoria || d.categoria || "outros",
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
