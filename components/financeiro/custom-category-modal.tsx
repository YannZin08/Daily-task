import React from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";
import { BottomSheetModal } from "@/components/financeiro/bottom-sheet-modal";

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
  const confirmar = () => {
    if (!value.trim()) {
      Alert.alert("Erro", "Digite o nome da categoria");
      return;
    }
    onConfirm(value.trim());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} colors={colors} insetsBottom={0} maxHeightRatio={0.6}>
      <Text className="text-foreground text-2xl font-bold mb-6">Nova Categoria</Text>

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
          NOME DA CATEGORIA
        </Text>
        <TextInput
          style={{ color: colors.foreground, fontSize: 16, fontWeight: "600", minHeight: 44 }}
          placeholder="Ex: Brinquedos, Livros..."
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
        <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Confirmar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose} style={{ padding: 16, alignItems: "center" }}>
        <Text style={{ color: colors.muted, fontWeight: "500" }}>Cancelar</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
