import React from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { BottomSheetModal } from "@/components/financeiro/bottom-sheet-modal";
import { useSettings } from "@/lib/settings-provider";

interface CustomCategoryModalProps {
  visible: boolean;
  value: string;
  onChangeValue: (text: string) => void;
  onConfirm: (nome: string) => void;
  onClose: () => void;
  colors: any;
}

export function CustomCategoryModal({
  visible,
  value,
  onChangeValue,
  onConfirm,
  onClose,
  colors,
}: CustomCategoryModalProps) {
  const { t } = useSettings();
  const confirmar = () => {
    if (!value.trim()) {
      Alert.alert(t("common.error"), t("financeiroModal.customCategoryError"));
      return;
    }
    onConfirm(value.trim());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} colors={colors} insetsBottom={0} maxHeightRatio={0.6}>
      <Text className="text-foreground text-2xl font-bold mb-6">{t("financeiroModal.customCategoryTitle")}</Text>

      <View
        style={{
          backgroundColor: colors.background,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: colors.muted, fontSize: 12, fontWeight: "bold", marginBottom: 8 }}>
          {t("financeiroModal.customCategoryLabel")}
        </Text>
        <TextInput
          style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", minHeight: 44 }}
          placeholder={t("financeiroModal.customCategoryPlaceholder")}
          placeholderTextColor={"rgba(255,255,255,0.2)"}
          value={value}
          onChangeText={onChangeValue}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={confirmar}
        />
      </View>

      <TouchableOpacity
        onPress={confirmar}
        style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 16, marginBottom: 12, alignItems: "center" }}
      >
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>{t("common.confirm")}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose} style={{ padding: 16, alignItems: "center" }}>
        <Text style={{ color: colors.muted, fontWeight: "500" }}>{t("common.cancel")}</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
