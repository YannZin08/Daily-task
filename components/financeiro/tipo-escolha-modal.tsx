import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { BottomSheetModal } from "@/components/financeiro/bottom-sheet-modal";

interface TipoEscolhaModalProps {
  visible: boolean;
  onEscolherFixo: () => void;
  onEscolherDespesa: () => void;
  onClose: () => void;
  colors: any;
  insetsBottom: number;
}

export function TipoEscolhaModal({
  visible,
  onEscolherFixo,
  onEscolherDespesa,
  onClose,
  colors,
  insetsBottom,
}: TipoEscolhaModalProps) {
  return (
    <BottomSheetModal visible={visible} onClose={onClose} colors={colors} insetsBottom={insetsBottom} maxHeightRatio={0.6}>
      <Text className="text-2xl font-bold text-foreground mb-6">Adicionar Despesa</Text>

      <TouchableOpacity
        onPress={onEscolherFixo}
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View className="bg-warning/20 w-12 h-12 rounded-full items-center justify-center mr-4">
          <IconSymbol name="house" size={24} color={colors.warning} />
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-bold text-base">Gasto Fixo</Text>
          <Text className="text-muted text-sm">Recorrente ou parcelado</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onEscolherDespesa}
        style={{
          backgroundColor: colors.background,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 20,
          marginBottom: 24,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View className="bg-primary/20 w-12 h-12 rounded-full items-center justify-center mr-4">
          <IconSymbol name="cart" size={24} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="text-foreground font-bold text-base">Despesa do Mês</Text>
          <Text className="text-muted text-sm">Gasto variável único</Text>
        </View>
        <IconSymbol name="chevron.right" size={20} color={colors.muted} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onClose} className="rounded-2xl py-4 px-4" style={{ backgroundColor: colors.surface2 }}>
        <Text className="text-center font-semibold text-foreground">Cancelar</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
