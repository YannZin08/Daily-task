import React, { useState } from "react";
import {
  ScrollView,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import Animated, { FadeInUp, FadeInRight, Layout } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useFinanceiro } from "@/hooks/use-financeiro";
import { Despesa } from "@/lib/financeiro-types";
import { useSettings } from "@/lib/settings-provider";
import { TipoEscolhaModal } from "@/components/financeiro/tipo-escolha-modal";
import { GastoFixoModal } from "@/components/financeiro/gasto-fixo-modal";
import { DespesaModal } from "@/components/financeiro/despesa-modal";
import { CategoryPickerModal } from "@/components/financeiro/category-picker-modal";
import { CustomCategoryModal } from "@/components/financeiro/custom-category-modal";

export default function FinanceiroScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, months, formatCurrency, locale } = useSettings();

  const {
    salario,
    atualizarSalario,
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
  } = useFinanceiro();

  // Escolha do tipo (fixo vs variável)
  const [showTipoModal, setShowTipoModal] = useState(false);

  // Formulário de Gasto Fixo
  const [showModalFixo, setShowModalFixo] = useState(false);
  const [editingFixo, setEditingFixo] = useState<string | null>(null);
  const [gastoFixo, setGastoFixo] = useState("");
  const [valorFixo, setValorFixo] = useState("");
  const [categoriaFixoSelecionada, setCategoriaFixoSelecionada] = useState<string | null>(null);
  const [quantidadeMeses, setQuantidadeMeses] = useState("1");
  const [showCategoryModalFixo, setShowCategoryModalFixo] = useState(false);
  const [showCustomCategoryModalFixo, setShowCustomCategoryModalFixo] = useState(false);
  const [customCategoryNameFixo, setCustomCategoryNameFixo] = useState("");

  // Formulário de Despesa Variável
  const [showModalDespesa, setShowModalDespesa] = useState(false);
  const [editingDespesa, setEditingDespesa] = useState<string | null>(null);
  const [nomeDespesa, setNomeDespesa] = useState("");
  const [valorDespesa, setValorDespesa] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCustomCategoryModal, setShowCustomCategoryModal] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");

  const fecharModalFixo = () => {
    setShowModalFixo(false);
    setGastoFixo("");
    setValorFixo("");
    setEditingFixo(null);
    setCategoriaFixoSelecionada(null);
    setQuantidadeMeses("1");
  };

  const fecharModalDespesa = () => {
    setShowModalDespesa(false);
    setNomeDespesa("");
    setValorDespesa("");
    setEditingDespesa(null);
    setCategoriaSelecionada(null);
  };

  const salvarGastoFixo = () => {
    const ok = editingFixo
      ? (editarGastoFixo(editingFixo, gastoFixo, valorFixo, categoriaFixoSelecionada), true)
      : adicionarGastoFixo(gastoFixo, valorFixo, categoriaFixoSelecionada, quantidadeMeses);
    if (ok) fecharModalFixo();
  };

  const abrirEdicaoFixo = (despesa: Despesa) => {
    setGastoFixo(despesa.nome);
    setValorFixo(despesa.valor.toString());
    setEditingFixo(despesa.id);
    setCategoriaFixoSelecionada(despesa.categoria || null);
    setShowModalFixo(true);
  };

  const salvarDespesa = () => {
    const ok = editingDespesa
      ? (editarDespesa(editingDespesa, nomeDespesa, valorDespesa), true)
      : adicionarDespesa(nomeDespesa, valorDespesa, categoriaSelecionada);
    if (ok) fecharModalDespesa();
  };

  const abrirEdicaoDespesa = (despesa: Despesa) => {
    setNomeDespesa(despesa.nome);
    setValorDespesa(despesa.valor.toString());
    setEditingDespesa(despesa.id);
    setShowModalDespesa(true);
  };

  // categoriaSelecionada/categoriaFixoSelecionada guardam o id da categoria;
  // aqui resolvemos o rótulo traduzido para exibir nos modais (com fallback
  // para o próprio valor salvo, cobrindo despesas antigas que guardavam o label).
  const categoriaSelecionadaLabel =
    categorias.find((c) => c.id === categoriaSelecionada)?.label ?? categoriaSelecionada;
  const categoriaFixoSelecionadaLabel =
    categorias.find((c) => c.id === categoriaFixoSelecionada)?.label ?? categoriaFixoSelecionada;

  if (isLoading) {
    return (
      <ScreenContainer className="flex-1 bg-background items-center justify-center">
        <Text className="text-muted">{t("financeiro.loading")}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} showsVerticalScrollIndicator={false}>
          {/* Header com Seletor de Mês */}
          <Animated.View entering={FadeInUp.duration(600)} className="px-6 pt-6 pb-4">
            <Text className="text-muted text-lg font-medium">{t("financeiro.headerEyebrow")}</Text>
            <View className="flex-row justify-between items-center">
              <Text style={{ fontFamily: "Sora_800ExtraBold" }} className="text-foreground text-3xl">{t("financeiro.headerTitle")}</Text>
              <TouchableOpacity
                onPress={() => router.push("/relatorios")}
                className="bg-surface w-12 h-12 rounded-2xl items-center justify-center border border-white/5"
              >
                <IconSymbol name="bar-chart" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between mt-6 bg-surface rounded-2xl px-4 py-3 border border-white/5">
              <TouchableOpacity onPress={mesAnterior} className="p-2">
                <Text className="text-2xl text-primary">‹</Text>
              </TouchableOpacity>
              <Text className="text-lg font-bold text-foreground">
                {months[mesSelecionado - 1]} {anoSelecionado}
              </Text>
              <TouchableOpacity onPress={proximoMes} className="p-2">
                <Text className="text-2xl text-primary">›</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Card Financeiro Principal - estilo cartão */}
          <Animated.View entering={FadeInUp.delay(200).duration(600)} className="px-6 py-4">
            <LinearGradient
              colors={[colors.primary, colors.primaryDeep]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ borderRadius: 32, padding: 24, marginBottom: 24, shadowColor: colors.primary, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10 }}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white/70 text-sm font-semibold uppercase tracking-widest">{t("financeiro.balanceLabel")}</Text>
                <View style={{ backgroundColor: colors.accent, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 }}>
                  <Text className="text-white text-[10px] font-bold uppercase tracking-wide">{t("financeiro.badgeCooperativo")}</Text>
                </View>
              </View>
              <Text style={{ fontFamily: "Sora_800ExtraBold" }} className="text-white text-4xl mb-6">
                {formatCurrency(saldoDisponivel)}
              </Text>

              <View className="flex-row justify-between border-t border-white/20 pt-6">
                <View>
                  <Text className="text-white/60 text-xs font-medium mb-1">{t("financeiro.income")}</Text>
                  <Text className="text-white text-lg font-bold">{formatCurrency(parseFloat(salario || "0"))}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-white/60 text-xs font-medium mb-1">{t("financeiro.expenses")}</Text>
                  <Text className="text-white text-lg font-bold">{formatCurrency(totalGastos)}</Text>
                </View>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Mini Cards Resumo */}
          <View className="px-6 py-4 flex-row gap-4 mb-4">
            <Animated.View entering={FadeInRight.delay(400).duration(600)} className="flex-1 bg-surface p-5 rounded-[24px] border border-white/5">
              <View className="bg-warning/20 w-10 h-10 rounded-full items-center justify-center mb-3">
                <IconSymbol name="house" size={20} color={colors.warning} />
              </View>
              <Text className="text-muted text-xs font-medium mb-1">{t("financeiro.fixedExpenses")}</Text>
              <Text className="text-foreground text-lg font-bold">{formatCurrency(totalFixos)}</Text>
            </Animated.View>

            <Animated.View entering={FadeInRight.delay(500).duration(600)} className="flex-1 bg-surface p-5 rounded-[24px] border border-white/5">
              <View className="bg-primary/20 w-10 h-10 rounded-full items-center justify-center mb-3">
                <IconSymbol name="cart" size={20} color={colors.primary} />
              </View>
              <Text className="text-muted text-xs font-medium mb-1">{t("financeiro.variableExpenses")}</Text>
              <Text className="text-foreground text-lg font-bold">{formatCurrency(totalVariaveis)}</Text>
            </Animated.View>
          </View>

          {/* Configuração de Salário */}
          <View className="px-6 py-4 mb-4">
            <Text className="text-muted text-xs font-bold uppercase tracking-widest mb-3">{t("financeiro.salaryConfigTitle")}</Text>
            <View className="bg-surface rounded-2xl flex-row items-center px-4 border border-white/5">
              <IconSymbol name="credit-card" size={20} color={colors.muted} />
              <TextInput
                className="flex-1 p-4 text-foreground font-semibold"
                placeholder={t("financeiro.salaryPlaceholder")}
                placeholderTextColor="rgba(255,255,255,0.3)"
                keyboardType="decimal-pad"
                returnKeyType="done"
                onSubmitEditing={() => Keyboard.dismiss()}
                value={salario}
                onChangeText={atualizarSalario}
              />
            </View>
          </View>

          {/* Gastos Fixos */}
          <View className="px-6 py-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-foreground text-lg font-bold">{t("financeiro.fixedExpenses")}</Text>
            </View>

            {despesasDoMes.filter((d) => d.isFixa).length > 0 ? (
              despesasDoMes
                .filter((d) => d.isFixa)
                .map((despesa, index) => (
                  <Animated.View
                    key={despesa.id}
                    entering={FadeInUp.delay(100 * index).duration(400)}
                    layout={Layout.springify()}
                    className="bg-surface p-4 rounded-3xl mb-3 flex-row items-center border border-white/5"
                  >
                    <View className="bg-warning/10 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                      <IconSymbol name="house" size={24} color={colors.warning} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base">{despesa.nome}</Text>
                      <Text className="text-muted text-xs font-medium">{t("financeiro.monthlyTag")}</Text>
                    </View>
                    <View className="items-end mr-4">
                      <Text className="text-foreground font-bold text-base">{formatCurrency(despesa.valor)}</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity onPress={() => abrirEdicaoFixo(despesa)} className="p-2">
                        <IconSymbol name="pencil" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deletarDespesa(despesa.id)} className="p-2">
                        <IconSymbol name="trash" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                ))
            ) : (
              <View className="items-center justify-center py-10">
                <View className="bg-surface w-16 h-16 rounded-3xl items-center justify-center mb-4 border border-white/5">
                  <IconSymbol name="house" size={28} color={colors.muted} />
                </View>
                <Text className="text-muted text-center px-10">{t("financeiro.fixedEmptyMessage")}</Text>
              </View>
            )}
          </View>

          {/* Despesas Variáveis */}
          <View className="px-6 py-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-foreground text-lg font-bold">{t("financeiro.monthExpensesTitle")}</Text>
            </View>

            {despesasDoMes.filter((d) => !d.isFixa).length > 0 ? (
              despesasDoMes
                .filter((d) => !d.isFixa)
                .map((despesa, index) => (
                  <Animated.View
                    key={despesa.id}
                    entering={FadeInUp.delay(100 * index).duration(400)}
                    layout={Layout.springify()}
                    className="bg-surface p-4 rounded-3xl mb-3 flex-row items-center border border-white/5"
                  >
                    <View className="bg-primary/10 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                      <IconSymbol name="cart" size={24} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-foreground font-bold text-base">{despesa.nome}</Text>
                      <Text className="text-muted text-xs font-medium">{new Date(parseInt(despesa.id, 10)).toLocaleDateString(locale)}</Text>
                    </View>
                    <View className="items-end mr-4">
                      <Text className="text-foreground font-bold text-base">{formatCurrency(despesa.valor)}</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity onPress={() => abrirEdicaoDespesa(despesa)} className="p-2">
                        <IconSymbol name="pencil" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deletarDespesa(despesa.id)} className="p-2">
                        <IconSymbol name="trash" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </Animated.View>
                ))
            ) : (
              <View className="items-center justify-center py-10">
                <View className="bg-surface w-16 h-16 rounded-3xl items-center justify-center mb-4 border border-white/5">
                  <IconSymbol name="cart" size={28} color={colors.muted} />
                </View>
                <Text className="text-muted text-center px-10">{t("financeiro.variableEmptyMessage")}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setShowTipoModal(true)}
        style={{
          position: "absolute",
          bottom: insets.bottom + 80,
          right: 24,
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <IconSymbol name="plus" size={32} color="#FFF" />
      </TouchableOpacity>

      <TipoEscolhaModal
        visible={showTipoModal}
        colors={colors}
        insetsBottom={insets.bottom}
        onClose={() => setShowTipoModal(false)}
        onEscolherFixo={() => {
          setShowTipoModal(false);
          fecharModalFixo();
          setShowModalFixo(true);
        }}
        onEscolherDespesa={() => {
          setShowTipoModal(false);
          fecharModalDespesa();
          setShowModalDespesa(true);
        }}
      />

      <GastoFixoModal
        visible={showModalFixo}
        isEditing={!!editingFixo}
        nome={gastoFixo}
        valor={valorFixo}
        categoria={categoriaFixoSelecionadaLabel}
        quantidadeMeses={quantidadeMeses}
        onChangeNome={setGastoFixo}
        onChangeValor={setValorFixo}
        onChangeQuantidadeMeses={setQuantidadeMeses}
        onAbrirCategoria={() => setShowCategoryModalFixo(true)}
        onSalvar={salvarGastoFixo}
        onClose={fecharModalFixo}
        colors={colors}
        insetsBottom={insets.bottom}
      />

      <DespesaModal
        visible={showModalDespesa}
        isEditing={!!editingDespesa}
        nome={nomeDespesa}
        valor={valorDespesa}
        categoria={categoriaSelecionadaLabel}
        onChangeNome={setNomeDespesa}
        onChangeValor={setValorDespesa}
        onAbrirCategoria={() => setShowCategoryModal(true)}
        onSalvar={salvarDespesa}
        onClose={fecharModalDespesa}
        colors={colors}
        insetsBottom={insets.bottom}
      />

      <CategoryPickerModal
        visible={showCategoryModal}
        categorias={categorias}
        selecionada={categoriaSelecionada}
        onSelect={(id) => {
          setCategoriaSelecionada(id);
          setShowCategoryModal(false);
        }}
        onRequestCustom={() => {
          setShowCategoryModal(false);
          setShowCustomCategoryModal(true);
        }}
        onClose={() => setShowCategoryModal(false)}
        colors={colors}
      />

      <CategoryPickerModal
        visible={showCategoryModalFixo}
        categorias={categorias}
        selecionada={categoriaFixoSelecionada}
        onSelect={(id) => {
          setCategoriaFixoSelecionada(id);
          setShowCategoryModalFixo(false);
        }}
        onRequestCustom={() => {
          setShowCategoryModalFixo(false);
          setShowCustomCategoryModalFixo(true);
        }}
        onClose={() => setShowCategoryModalFixo(false)}
        colors={colors}
      />

      <CustomCategoryModal
        visible={showCustomCategoryModal}
        value={customCategoryName}
        onChangeValue={setCustomCategoryName}
        onConfirm={async (nome) => {
          const nova = await adicionarCategoriaCustomizada(nome);
          if (nova) setCategoriaSelecionada(nova.id);
          setCustomCategoryName("");
          setShowCustomCategoryModal(false);
        }}
        onClose={() => setShowCustomCategoryModal(false)}
        colors={colors}
      />

      <CustomCategoryModal
        visible={showCustomCategoryModalFixo}
        value={customCategoryNameFixo}
        onChangeValue={setCustomCategoryNameFixo}
        onConfirm={async (nome) => {
          const nova = await adicionarCategoriaCustomizada(nome);
          if (nova) setCategoriaFixoSelecionada(nova.id);
          setCustomCategoryNameFixo("");
          setShowCustomCategoryModalFixo(false);
        }}
        onClose={() => setShowCustomCategoryModalFixo(false)}
        colors={colors}
      />
    </ScreenContainer>
  );
}
