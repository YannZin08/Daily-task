import React, { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeInRight } from "react-native-reanimated";
import { useSettings } from "@/lib/settings-provider";

const { width } = Dimensions.get("window");

interface Despesa {
  id: string;
  nome: string;
  valor: number;
  isFixa: boolean;
  mes: number;
  ano: number;
}

export default function RelatoriosScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, formatCurrency } = useSettings();

  const [despesas, setDespesas] = useState<Despesa[]>([]);
  const [salario, setSalario] = useState(0);
  
  const hoje = new Date();
  const [mesSelecionado] = useState(hoje.getMonth() + 1);
  const [anoSelecionado] = useState(hoje.getFullYear());

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const dados = await AsyncStorage.getItem("financeiroDados");
      if (dados) {
        const parsed = JSON.parse(dados);
        setDespesas(parsed.despesas || []);
        setSalario(parseFloat(parsed.salario) || 0);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const despesasDoMes = despesas.filter(
    (d) => d.mes === mesSelecionado && d.ano === anoSelecionado
  );

  const totalGastos = despesasDoMes.reduce((sum, d) => sum + d.valor, 0);
  const totalFixos = despesasDoMes
    .filter((d) => d.isFixa)
    .reduce((sum, d) => sum + d.valor, 0);
  const totalVariaveis = totalGastos - totalFixos;
  
  const economia = salario - totalGastos;
  const porcentagemEconomia = salario > 0 ? (economia / salario) * 100 : 0;

  // Top 5 Despesas
  const topDespesas = [...despesasDoMes]
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  return (
    <ScreenContainer className="flex-1 bg-background">
      <View className="px-6 pt-6 pb-4 flex-row items-center">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="bg-surface w-10 h-10 rounded-full items-center justify-center mr-4 border border-white/5"
        >
          <IconSymbol name="chevron.right" size={24} color={colors.foreground} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <Text style={{ fontFamily: "Sora_800ExtraBold" }} className="text-foreground text-2xl">{t("relatorios.title")}</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Card Resumo de Economia */}
        <Animated.View
          entering={FadeInUp.duration(600)}
          className="px-6 py-4"
        >
          <View className="bg-surface p-6 rounded-[32px] border border-white/5">
            <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-2">{t("relatorios.savingsTitle")}</Text>
            <View className="flex-row items-end mb-4">
              <Text style={{ fontFamily: "Sora_800ExtraBold" }} className={`text-3xl ${economia >= 0 ? 'text-success' : 'text-error'}`}>
                {porcentagemEconomia.toFixed(1)}%
              </Text>
              <Text className="text-muted text-sm mb-1 ml-2">{t("relatorios.ofSalary")}</Text>
            </View>

            {/* Barra de Progresso Simples */}
            <View className="h-3 bg-white/5 rounded-full overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{ width: `${Math.min(Math.max(porcentagemEconomia, 0), 100)}%` }}
              />
            </View>
            <Text className="text-muted text-xs mt-3">
              {economia >= 0
                ? `${t("relatorios.savedPrefix")} ${formatCurrency(economia)} ${t("relatorios.savedSuffix")}`
                : `${t("relatorios.overspentPrefix")} ${formatCurrency(Math.abs(economia))} ${t("relatorios.overspentSuffix")}`}
            </Text>
          </View>
        </Animated.View>

        {/* Gráfico de Distribuição (Simulado com Barras Horizontais) */}
        <Animated.View
          entering={FadeInUp.delay(200).duration(600)}
          className="px-6 py-4"
        >
          <Text className="text-foreground text-lg font-bold mb-4">{t("relatorios.distributionTitle")}</Text>
          <View className="bg-surface p-6 rounded-[32px] border border-white/5">
            <View className="mb-6">
              <View className="flex-row justify-between mb-2">
                <Text className="text-foreground font-medium">{t("financeiro.fixedExpenses")}</Text>
                <Text className="text-muted">{((totalFixos / (totalGastos || 1)) * 100).toFixed(0)}%</Text>
              </View>
              <View className="h-4 bg-white/5 rounded-full overflow-hidden">
                <View
                  className="h-full bg-warning"
                  style={{ width: `${(totalFixos / (totalGastos || 1)) * 100}%` }}
                />
              </View>
              <Text className="text-warning text-xs mt-1 font-bold">{formatCurrency(totalFixos)}</Text>
            </View>

            <View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-foreground font-medium">{t("relatorios.variableExpensesFull")}</Text>
                <Text className="text-muted">{((totalVariaveis / (totalGastos || 1)) * 100).toFixed(0)}%</Text>
              </View>
              <View className="h-4 bg-white/5 rounded-full overflow-hidden">
                <View
                  className="h-full bg-primary"
                  style={{ width: `${(totalVariaveis / (totalGastos || 1)) * 100}%` }}
                />
              </View>
              <Text className="text-primary text-xs mt-1 font-bold">{formatCurrency(totalVariaveis)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Maiores Gastos */}
        <Animated.View
          entering={FadeInUp.delay(400).duration(600)}
          className="px-6 py-4"
        >
          <Text className="text-foreground text-lg font-bold mb-4">{t("relatorios.topExpensesTitle")}</Text>
          {topDespesas.length > 0 ? (
            topDespesas.map((despesa, index) => (
              <View
                key={despesa.id}
                className="bg-surface p-4 rounded-2xl mb-3 flex-row items-center border border-white/5"
              >
                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${despesa.isFixa ? 'bg-warning/10' : 'bg-primary/10'}`}>
                  <IconSymbol name={despesa.isFixa ? "house" : "cart"} size={20} color={despesa.isFixa ? colors.warning : colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold">{despesa.nome}</Text>
                  <Text className="text-muted text-xs">{despesa.isFixa ? t("relatorios.fixedTag") : t("relatorios.variableTag")}</Text>
                </View>
                <Text className="text-foreground font-bold">{formatCurrency(despesa.valor)}</Text>
              </View>
            ))
          ) : (
            <View className="bg-surface p-8 rounded-[32px] items-center border border-white/5">
              <Text className="text-muted">{t("relatorios.noExpenses")}</Text>
            </View>
          )}
        </Animated.View>

        {/* Dica de IA (Simulada) */}
        <Animated.View
          entering={FadeInRight.delay(600).duration(600)}
          className="px-6 py-4"
        >
          <View className="bg-primary/10 p-6 rounded-[32px] border border-primary/20">
            <View className="flex-row items-center mb-3">
              <IconSymbol name="info" size={20} color={colors.primary} />
              <Text className="text-primary font-bold ml-2 uppercase tracking-widest text-xs">{t("relatorios.tipTitle")}</Text>
            </View>
            <Text className="text-foreground leading-6">
              {totalFixos > totalVariaveis
                ? t("relatorios.tipFixed")
                : t("relatorios.tipVariable")}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
