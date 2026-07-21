import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BottomSheetModal } from "@/components/financeiro/bottom-sheet-modal";
import { useSettings } from "@/lib/settings-provider";

interface GastoFixoModalProps {
  visible: boolean;
  isEditing: boolean;
  nome: string;
  valor: string;
  categoria: string | null;
  quantidadeMeses: string;
  onChangeNome: (v: string) => void;
  onChangeValor: (v: string) => void;
  onChangeQuantidadeMeses: (v: string) => void;
  onAbrirCategoria: () => void;
  onSalvar: () => void;
  onClose: () => void;
  colors: any;
  insetsBottom: number;
}

export function GastoFixoModal({
  visible,
  isEditing,
  nome,
  valor,
  categoria,
  quantidadeMeses,
  onChangeNome,
  onChangeValor,
  onChangeQuantidadeMeses,
  onAbrirCategoria,
  onSalvar,
  onClose,
  colors,
  insetsBottom,
}: GastoFixoModalProps) {
  const { t, formatCurrency } = useSettings();
  return (
    <BottomSheetModal visible={visible} onClose={onClose} colors={colors} insetsBottom={insetsBottom}>
      <Text className="text-2xl font-bold text-foreground mb-6">
        {isEditing ? t("financeiroModal.editFixedTitle") : t("financeiroModal.newFixedTitle")}
      </Text>

      <Text className="text-sm font-semibold text-foreground mb-3">{t("financeiroModal.nameLabel")}</Text>
      <TextInput
        value={nome}
        onChangeText={onChangeNome}
        placeholder={t("financeiroModal.fixedNamePlaceholder")}
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

      {!isEditing && (
        <>
          <Text className="text-sm font-semibold text-foreground mb-3">{t("financeiroModal.installmentsLabel")}</Text>
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <TextInput
              value={quantidadeMeses}
              onChangeText={onChangeQuantidadeMeses}
              placeholder="1"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={2}
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 12,
                padding: 14,
                color: colors.foreground,
                flex: 1,
                textAlign: "center",
              }}
            />
            <View style={{ flex: 2, justifyContent: "center", paddingLeft: 12 }}>
              <Text style={{ color: colors.muted, fontSize: 12 }}>
                {t("financeiroModal.installmentsTotal")}{" "}
                {formatCurrency(parseFloat(valor || "0") * (parseInt(quantidadeMeses, 10) || 1))}
              </Text>
              <Text style={{ color: colors.muted, fontSize: 12, marginTop: 4 }}>{t("financeiroModal.installmentsMax")}</Text>
            </View>
          </View>
        </>
      )}

      <TouchableOpacity onPress={onSalvar} style={{ backgroundColor: colors.primary }} className="rounded-2xl py-4 px-4 mb-3">
        <Text className="text-center font-bold text-lg text-white">{isEditing ? t("financeiroModal.update") : t("financeiroModal.save")}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose} className="rounded-2xl py-4 px-4" style={{ backgroundColor: colors.surface2 }}>
        <Text className="text-center font-semibold text-foreground">{t("common.cancel")}</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
