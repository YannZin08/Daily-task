import React from "react";
import { View, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeContext } from "@/lib/theme-provider";
import { useColors } from "@/hooks/use-colors";

export function ThemeToggleHeader() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useThemeContext();

  const toggleTheme = () => {
    const newScheme = colorScheme === "light" ? "dark" : "light";
    setColorScheme(newScheme);
  };

  const styles = StyleSheet.create({
    header: {
      paddingTop: insets.top + 8,
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    container: {
      flexDirection: "row",
      justifyContent: "flex-end",
      alignItems: "center",
    },
    themeButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeButtonIcon: {
      fontSize: 20,
    },
  });

  return (
    <View style={styles.header}>
      <View style={styles.container}>
        <Pressable
          style={({ pressed }) => [
            styles.themeButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={toggleTheme}
        >
          <Text style={styles.themeButtonIcon}>
            {colorScheme === "light" ? "🌙" : "☀️"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
