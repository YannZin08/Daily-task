import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Haptics from "expo-haptics";
import { Categoria } from "@/lib/financeiro-types";
import { BottomSheetModal } from "@/components/financeiro/bottom-sheet-modal";

interface CategoryPickerModalProps {
  visible: boolean;
  categorias: Categoria[];
  selecionada: string | null;
  onSelect: (label: string) => void;
  onRequestCustom: () => void;
  onClose: () => void;
  colors: any;
}

export function CategoryPickerModal({
  visible,
  categorias,
  selecionada,
  onSelect,
  onRequestCustom,
  onClose,
  colors,
}: CategoryPickerModalProps) {
  return (
    <BottomSheetModal visible={visible} onClose={onClose} colors={colors} insetsBottom={16}>
      <Text className="text-foreground text-2xl font-bold mb-6">Escolha a Categoria</Text>

      <View style={{ gap: 12 }}>
        {categorias.map((cat) => {
          const isSelected = selecionada === cat.label;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => {
                if (cat.id === "outra") {
                  onRequestCustom();
                } else {
                  onSelect(cat.label);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              style={{
                padding: 16,
                borderRadius: 16,
                backgroundColor: isSelected ? colors.primary + "20" : colors.background,
                borderWidth: 1,
                borderColor: isSelected ? colors.primary : colors.border,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: isSelected ? colors.primary + "30" : colors.background,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 16,
                }}
              >
                <MaterialIcons
                  name={cat.icon as any}
                  size={24}
                  color={isSelected ? colors.primary : colors.muted}
                  style={{ opacity: 0.7 }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                    color: isSelected ? colors.primary : colors.foreground,
                  }}
                >
                  {cat.label}
                </Text>
              </View>
              {isSelected && (
                <View
                  style={{
                    backgroundColor: colors.primary,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold" }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity onPress={onClose} style={{ padding: 16, alignItems: "center", marginTop: 16 }}>
        <Text style={{ color: colors.muted, fontWeight: "500" }}>Fechar</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
}
