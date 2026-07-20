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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useThemeContext();

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
          dialogTitle: "Salvar backup do Daily Task",
        });
      } else {
        Alert.alert("Backup criado", `Não foi possível abrir o compartilhamento. Arquivo salvo em:\n${file.uri}`);
      }
    } catch (error) {
      console.error("Erro ao exportar dados:", error);
      Alert.alert("Erro", "Não foi possível exportar os dados. Tente novamente.");
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
        Alert.alert("Arquivo inválido", "Esse arquivo não parece ser um backup válido do Daily Task.");
        return;
      }

      Alert.alert(
        "Importar Backup",
        "Isso vai substituir todas as tarefas e dados financeiros atuais pelos dados desse arquivo. Deseja continuar?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Importar",
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
                Alert.alert("Pronto", "Dados importados com sucesso. Abra as abas de Tarefas e Financeiro para conferir.");
              } catch (error) {
                console.error("Erro ao aplicar backup:", error);
                Alert.alert("Erro", "Não foi possível aplicar o backup.");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erro ao importar dados:", error);
      Alert.alert("Erro", "Não foi possível ler o arquivo selecionado. Verifique se é um backup válido.");
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Limpar Dados",
      "Isso vai apagar todas as suas tarefas e dados financeiros deste aparelho. Essa ação não pode ser desfeita. Deseja continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar Tudo",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(["tasks", "financeiroDados", "categoriasCustomizadas"]);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Pronto", "Todos os dados foram apagados.");
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert("Erro", "Não foi possível apagar os dados. Tente novamente.");
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
          <Text className="text-muted text-lg font-medium">Minhas</Text>
          <Text style={{ fontFamily: "Sora_800ExtraBold" }} className="text-foreground text-3xl">Configurações</Text>
        </Animated.View>

        {/* Seção de Aparência */}
        <Animated.View entering={FadeInUp.delay(200).duration(600)} className="px-6 py-4">
          <Text className="text-foreground text-lg font-bold mb-4">Aparência</Text>

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
                <Text className="text-foreground font-bold text-base">Modo Escuro</Text>
                <Text className="text-muted text-xs font-medium">
                  {colorScheme === "dark" ? "Ativado" : "Desativado"}
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

        {/* Seção de Informações */}
        <Animated.View entering={FadeInUp.delay(400).duration(600)} className="px-6 py-4">
          <Text className="text-foreground text-lg font-bold mb-4">Sobre</Text>

          {/* Card Versão */}
          <View className="bg-surface rounded-2xl p-5 border border-white/5 mb-3">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-success/20 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                  <IconSymbol name="info" size={24} color={colors.success} />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-base">Versão</Text>
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
                  <Text className="text-foreground font-bold text-base">Task Daily</Text>
                  <Text className="text-muted text-xs font-medium">Seu assistente de tarefas e finanças</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Seção de Dados */}
        <Animated.View entering={FadeInUp.delay(600).duration(600)} className="px-6 py-4">
          <Text className="text-foreground text-lg font-bold mb-4">Dados</Text>

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
                <Text className="text-foreground font-bold text-base">Exportar Backup</Text>
                <Text className="text-muted text-xs font-medium">Salvar tarefas e financeiro em um arquivo</Text>
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
                <Text className="text-foreground font-bold text-base">Importar Backup</Text>
                <Text className="text-muted text-xs font-medium">Restaurar a partir de um arquivo salvo</Text>
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
                <Text className="text-foreground font-bold text-base">Limpar Dados</Text>
                <Text className="text-muted text-xs font-medium">Remover todas as tarefas e despesas</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.muted} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}
