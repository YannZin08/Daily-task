import React from "react";
import { ScrollView, Text, View, TouchableOpacity, Switch, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeContext } from "@/lib/theme-provider";
import { useSettings } from "@/lib/settings-provider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useThemeContext();
  const { language, setLanguage, currency, setCurrency, t } = useSettings();

  const handleThemeToggle = (value: boolean) => {
    setColorScheme(value ? "dark" : "light");
  };

  const BACKUP_KEYS = ["tasks", "financeiroDados", "categoriasCustomizadas"] as const;

  const handleExportarDados = async () => {
    try {
      const valores = await AsyncStorage.multiGet(BACKUP_KEYS);
      const dados: Record<string, unknown> = {};
      valores.forEach(([chave, valor]) => {
        dados[chave] = valor ? JSON.parse(valor) : null;
      });

      const backup = {
        app: "daily-task",
        versao: 1,
        exportadoEm: new Date().toISOString(),
        dados,
      };

      const dataArquivo = new Date().toISOString().slice(0, 10);
      const file = new File(Paths.cache, `daily-task-backup-${dataArquivo}.json`);
      if (file.exists) file.delete();
      file.create();
      await file.write(JSON.stringify(backup, null, 2));

      const disponivel = await Sharing.isAvailableAsync();
      if (disponivel) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/json",
          dialogTitle: t("settings.shareDialogTitle"),
        });
      } else {
        Alert.alert(t("settings.exportFallbackTitle"), `${t("settings.exportFallbackMessage")}\n${file.uri}`);
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      Alert.alert(t("common.error"), t("settings.exportErrorMessage"));
    }
  };

  const handleImportarDados = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: "application/json",
        copyToCacheDirectory: true,
      });
      if (resultado.canceled || !resultado.assets?.[0]) return;

      const arquivoSelecionado = new File(resultado.assets[0].uri);
      const conteudo = await arquivoSelecionado.text();
      const backup = JSON.parse(conteudo);

      if (!backup || typeof backup.dados !== "object") {
        Alert.alert(t("settings.importInvalidTitle"), t("settings.importInvalidMessage"));
        return;
      }

      Alert.alert(
        t("settings.importTitle"),
        t("settings.importConfirmMessage"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("settings.importTitle"),
            style: "destructive",
            onPress: async () => {
              try {
                const entradas: [string, string][] = BACKUP_KEYS.filter(
                  (chave) => backup.dados[chave] !== null && backup.dados[chave] !== undefined
                ).map((chave) => [chave, JSON.stringify(backup.dados[chave])]);

                if (entradas.length > 0) {
                  await AsyncStorage.multiSet(entradas);
                }

                const chavesAusentes = BACKUP_KEYS.filter(
                  (chave) => backup.dados[chave] === null || backup.dados[chave] === undefined
                );
                if (chavesAusentes.length > 0) {
                  await AsyncStorage.multiRemove(chavesAusentes);
                }

                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                Alert.alert(t("common.done"), t("settings.importSuccessMessage"));
              } catch (error) {
                console.error("Erro ao aplicar backup:", error);
                Alert.alert(t("common.error"), t("settings.importErrorMessage"));
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      Alert.alert(t("common.error"), t("settings.importReadErrorMessage"));
    }
  };

  const handleClearData = () => {
    Alert.alert(
      t("settings.clearTitle"),
      t("settings.clearConfirmMessage"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("settings.clearConfirmButton"),
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(["tasks", "financeiroDados", "categoriasCustomizadas"]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert(t("common.done"), t("settings.clearSuccessMessage"));
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert(t("common.error"), t("settings.clearErrorMessage"));
            }
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600)} className="px-6 pt-6 pb-4">
          <Text className="text-muted text-lg font-medium">{t("settings.headerEyebrow")}</Text>
          <Text style={{ fontFamily: "Sora_800ExtraBold" }} className="text-foreground text-3xl">{t("settings.headerTitle")}</Text>
        </Animated.View>

        {/* Seção de Aparência */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} className="px-6 py-4">
          <Text className="text-foreground text-lg font-bold mb-4">{t("settings.appearanceSection")}</Text>

          {/* Card Tema */}
          <View className="bg-surface rounded-2xl p-5 border border-white/5 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className="bg-primary/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                <IconSymbol
                  name={colorScheme === "dark" ? "moon" : "sun"}
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-base">{t("settings.darkMode")}</Text>
                <Text className="text-muted text-xs font-medium">
                  {colorScheme === "dark" ? t("settings.enabled") : t("settings.disabled")}
                </Text>
              </View>
            </View>
            <Switch
              value={colorScheme === "dark"}
              onValueChange={handleThemeToggle}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colorScheme === "dark" ? colors.primary : colors.surface}
            />
          </View>
        </Animated.View>

        {/* Seção de Preferências (Idioma / Moeda) */}
        <Animated.View entering={FadeInUp.delay(300).duration(600)} className="px-6 py-4">
          <Text className="text-foreground text-lg font-bold mb-4">{t("settings.preferencesSection")}</Text>

          {/* Card Idioma */}
          <View className="bg-surface rounded-2xl p-5 border border-white/5 mb-3">
            <View className="flex-row items-center mb-4">
              <View className="bg-primary/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                <IconSymbol name="info" size={24} color={colors.primary} />
              </View>
              <Text className="text-foreground font-bold text-base">{t("settings.language")}</Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setLanguage("pt")}
                className="flex-1 rounded-xl py-3 items-center border"
                style={{
                  backgroundColor: language === "pt" ? colors.primary : "transparent",
                  borderColor: language === "pt" ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{ color: language === "pt" ? "#FFF" : colors.foreground }}
                >
                  {t("settings.languagePt")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setLanguage("en")}
                className="flex-1 rounded-xl py-3 items-center border"
                style={{
                  backgroundColor: language === "en" ? colors.primary : "transparent",
                  borderColor: language === "en" ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{ color: language === "en" ? "#FFF" : colors.foreground }}
                >
                  {t("settings.languageEn")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card Moeda */}
          <View className="bg-surface rounded-2xl p-5 border border-white/5">
            <View className="flex-row items-center mb-4">
              <View className="bg-accent/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                <IconSymbol name="credit-card" size={24} color={colors.accent} />
              </View>
              <Text className="text-foreground font-bold text-base">{t("settings.currency")}</Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setCurrency("BRL")}
                className="flex-1 rounded-xl py-3 items-center border"
                style={{
                  backgroundColor: currency === "BRL" ? colors.primary : "transparent",
                  borderColor: currency === "BRL" ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{ color: currency === "BRL" ? "#FFF" : colors.foreground }}
                >
                  {t("settings.currencyBRL")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCurrency("USD")}
                className="flex-1 rounded-xl py-3 items-center border"
                style={{
                  backgroundColor: currency === "USD" ? colors.primary : "transparent",
                  borderColor: currency === "USD" ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{ color: currency === "USD" ? "#FFF" : colors.foreground }}
                >
                  {t("settings.currencyUSD")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Seção de Informações */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} className="px-6 py-4">
          <Text className="text-foreground text-lg font-bold mb-4">{t("settings.aboutSection")}</Text>

          {/* Card Versão */}
          <View className="bg-surface rounded-2xl p-5 border border-white/5 mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-success/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                  <IconSymbol name="info" size={24} color={colors.success} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-base">{t("settings.version")}</Text>
                  <Text className="text-muted text-xs font-medium">1.0.0</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Card Desenvolvedor */}
          <View className="bg-surface rounded-2xl p-5 border border-white/5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-warning/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                  <IconSymbol name="code" size={24} color={colors.warning} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-base">{t("settings.appName")}</Text>
                  <Text className="text-muted text-xs font-medium">{t("settings.appSubtitle")}</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Seção de Dados */}
        <Animated.View entering={FadeInUp.delay(600).duration(600)} className="px-6 py-4">
          <Text className="text-foreground text-lg font-bold mb-4">{t("settings.dataSection")}</Text>

          {/* Card Exportar Backup */}
          <TouchableOpacity
            onPress={handleExportarDados}
            className="bg-surface rounded-2xl p-5 border border-white/5 flex-row items-center justify-between mb-3"
          >
            <View className="flex-row items-center flex-1">
              <View className="bg-primary/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                <IconSymbol name="upload" size={24} color={colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-base">{t("settings.exportTitle")}</Text>
                <Text className="text-muted text-xs font-medium">{t("settings.exportSubtitle")}</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* Card Importar Backup */}
          <TouchableOpacity
            onPress={handleImportarDados}
            className="bg-surface rounded-2xl p-5 border border-white/5 flex-row items-center justify-between mb-3"
          >
            <View className="flex-row items-center flex-1">
              <View className="bg-success/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                <IconSymbol name="download" size={24} color={colors.success} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-base">{t("settings.importTitle")}</Text>
                <Text className="text-muted text-xs font-medium">{t("settings.importSubtitle")}</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>

          {/* Card Limpar Dados */}
          <TouchableOpacity
            onPress={handleClearData}
            className="bg-surface rounded-2xl p-5 border border-white/5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center flex-1">
              <View className="bg-error/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                <IconSymbol name="trash" size={24} color={colors.error} />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-base">{t("settings.clearTitle")}</Text>
                <Text className="text-muted text-xs font-medium">{t("settings.clearSubtitle")}</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
