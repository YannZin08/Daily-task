import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BottomSheetModal } from "@/components/financeiro/bottom-sheet-modal";
import { useSettings } from "@/lib/settings-provider";

interface DespesaModalProps {
  visible: boolean;
  isEditing: boolean;
  nome: string;
  valor: string;
  categoria: string | null;
  onChangeNome: (v: string) => void;
  onChangeValor: (v: string) => void;
  onAbrirCategoria: () => void;
  onSalvar: () => void;
  onClose: () => void;
  colors: any;
  insetsBottom: number;
}

export function DespesaModal({
  visible,
  isEditing,
  nome,
  valor,
  categoria,
  onChangeNome,
  onChangeValor,
  onAbrirCategoria,
  onSalvar,
  onClose,
  colors,
  insetsBottom,
}: DespesaModalProps) {
  const { t } = useSettings();
  return (
    <BottomSheetModal visible={visible} onClose={onClose} colors={colors} insetsBottom={insetsBottom}>
      <Text className="text-2xl font-bold text-foreground mb-6">{isEditing ? t("financeiroModal.editExpenseTitle") : t("financeiroModal.newExpenseTitle")}</Text>

      <Text className="text-sm font-semibold text-foreground mb-3">{t("financeiroModal.nameLabel")}</Text>
      <TextInput
        value={nome}
        onChangeText={onChangeNome}
        placeholder={t("financeiroModal.expenseNamePlaceholder")}
        placeholderTextColor={colors.muted}
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          marginBottom: 18,
          color: colors.foreground,
        }}
      />

      <Text className="text-sm font-semibold text-foreground mb-3">{t("financeiroModal.valueLabel")}</Text>
      <TextInput
        value={valor}
        onChangeText={onChangeValor}
        placeholder={t("financeiroModal.valuePlaceholder")}
        placeholderTextColor={colors.muted}
        keyboardType="decimal-pad"
        returnKeyType="done"
        onSubmitEditing={onSalvar}
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          marginBottom: 24,
          color: colors.foreground,
        }}
      />

      <Text className="text-sm font-semibold text-foreground mb-3">{t("financeiroModal.categoryLabel")}</Text>
      <TouchableOpacity
        onPress={onAbrirCategoria}
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 12,
          padding: 14,
          marginBottom: 24,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: categoria ? colors.foreground : colors.muted }}>
          {categoria || t("financeiroModal.categoryPlaceholder")}
        </Text>
        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onSalvar} style={{ backgroundColor: colors.primary }} className="rounded-2xl py-4 px-4 mb-3">
        <Text className="text-center font-bold text-lg text-white">{isEditing ? t("financeiroModal.update") : t("financeiroModal.add")}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose} className="rounded-2xl py-4 px-4" style={{ backgroundColor: colors.surface2 }}>
        <Text className="text-center font-semibold text-foreground">{t("common.cancel")}</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
