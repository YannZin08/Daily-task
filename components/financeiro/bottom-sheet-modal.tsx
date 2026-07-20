import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  useWindowDimensions,
  View,
} from "react-native";

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  colors: any;
  insetsBottom: number;
  children: React.ReactNode;
  /** Quanto da altura da tela o modal pode ocupar no máximo (0 a 1). Padrão: 0.85 */
  maxHeightRatio?: number;
}

/**
 * Casco compartilhado dos modais em formato "bottom sheet" do Financeiro.
 * Resolve o teclado cobrindo os campos: empurra a folha pra cima (KeyboardAvoidingView)
 * e deixa o conteúdo rolável (ScrollView), com altura máxima relativa à tela do
 * aparelho — funciona bem tanto em celulares pequenos quanto em telas grandes.
 */
export function BottomSheetModal({
  visible,
  onClose,
  colors,
  insetsBottom,
  children,
  maxHeightRatio = 0.85,
}: BottomSheetModalProps) {
  const { height: screenHeight } = useWindowDimensions();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.6)", justifyContent: "flex-end" }}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        >
          <Pressable
            style={{
              backgroundColor: colors.surface,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              maxHeight: screenHeight * maxHeightRatio,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View
              style={{
                width: 48,
                height: 5,
                backgroundColor: colors.border,
                borderRadius: 2.5,
                alignSelf: "center",
                marginTop: 14,
                marginBottom: 10,
              }}
            />

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 24,
                paddingBottom: Math.max(insetsBottom, 24) + 16,
              }}
            >
              {children}
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
