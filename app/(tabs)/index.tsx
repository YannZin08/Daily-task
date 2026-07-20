import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "@react-navigation/native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import { ProgressRing } from "@/components/progress-ring";
import { TaskItem } from "@/components/task-item";
import { Task } from "@/lib/task-types";

const STORAGE_KEY = "tasks";

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const colors = useColors();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      setTasks(storedTasks ? JSON.parse(storedTasks) : []);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading tasks:", error);
      setIsLoading(false);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error("Error saving tasks:", error);
    }
  };

  const addTask = () => {
    if (inputValue.trim() === "") {
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };

    const updatedTasks = [newTask, ...tasks];
    saveTasks(updatedTasks);
    setInputValue("");
    setModalVisible(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleTask = (id: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    saveTasks(updatedTasks);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteTask = (id: string) => {
    Alert.alert("Excluir Tarefa", "Tem certeza que deseja excluir esta tarefa?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          const updatedTasks = tasks.filter((task) => task.id !== id);
          saveTasks(updatedTasks);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const addSubtask = (taskId: string, texto: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, subtasks: [...(task.subtasks || []), { id: Date.now().toString(), texto, concluida: false }] }
        : task
    );
    saveTasks(updatedTasks);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? {
            ...task,
            subtasks: (task.subtasks || []).map((sub) =>
              sub.id === subtaskId ? { ...sub, concluida: !sub.concluida } : sub
            ),
          }
        : task
    );
    saveTasks(updatedTasks);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, subtasks: (task.subtasks || []).filter((sub) => sub.id !== subtaskId) }
        : task
    );
    saveTasks(updatedTasks);
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const progress = tasks.length > 0 ? completedCount / tasks.length : 0;
  const isAllDone = tasks.length > 0 && completedCount === tasks.length;

  return (
    <Animated.View entering={FadeIn.duration(500)} style={{ flex: 1 }}>
      <ScreenContainer className="flex-1 bg-background">
        <View className="px-6 pt-4 flex-1">
          {/* Header */}
          <Animated.View entering={FadeInUp.duration(600)} className="mb-8 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-muted text-lg font-medium">Minhas</Text>
              <Text style={{ fontFamily: "Sora_800ExtraBold" }} className="text-foreground text-3xl">Tarefas Diárias</Text>
            </View>

            {!isLoading && tasks.length > 0 && (
              <ProgressRing progress={progress} color={isAllDone ? colors.accent : colors.primary} trackColor={colors.border}>
                <Text className="text-foreground text-base font-bold">
                  {completedCount}/{tasks.length}
                </Text>
              </ProgressRing>
            )}
          </Animated.View>

          {/* Task List */}
          {isLoading ? (
            <View className="flex-1 items-center justify-center">
              <Text className="text-muted">Carregando tarefas...</Text>
            </View>
          ) : (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
              renderItem={({ item, index }) => (
                <TaskItem
                  task={item}
                  index={index}
                  colors={colors}
                  onToggle={() => toggleTask(item.id)}
                  onDelete={() => deleteTask(item.id)}
                  onToggleSubtask={(subtaskId) => toggleSubtask(item.id, subtaskId)}
                  onAddSubtask={(texto) => addSubtask(item.id, texto)}
                  onDeleteSubtask={(subtaskId) => deleteSubtask(item.id, subtaskId)}
                />
              )}
              ListEmptyComponent={() => (
                <View className="items-center justify-center py-20">
                  <View className="bg-surface w-20 h-20 rounded-[30px] items-center justify-center mb-6 border border-white/5">
                    <IconSymbol name="calendar" size={32} color={colors.muted} />
                  </View>
                  <Text className="text-foreground text-xl font-bold mb-2">Tudo limpo por aqui!</Text>
                  <Text className="text-muted text-center px-10">Você não tem tarefas pendentes. Toque no + para adicionar uma.</Text>
                </View>
              )}
            />
          )}
        </View>

        {/* FAB */}
        <Animated.View entering={FadeInUp.delay(300).duration(500)} style={{ position: 'absolute', bottom: insets.bottom + 80, right: 24 }}>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <IconSymbol name="plus" size={32} color="#FFF" />
          </TouchableOpacity>
        </Animated.View>

        {/* Add Task Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <Pressable 
              className="flex-1 bg-black/60 justify-end"
              onPress={() => setModalVisible(false)}
            >
              <Animated.View entering={FadeInUp.duration(400)}>
                <Pressable 
                  className="bg-surface rounded-t-[40px] p-8"
                  style={{ paddingBottom: Math.max(insets.bottom, 32) }}
                  onPress={(e) => e.stopPropagation()}
                >
                  <View className="w-12 h-1.5 bg-white/10 rounded-full self-center mb-8" />
                  
                  <Text className="text-foreground text-2xl font-bold mb-6">Nova Tarefa</Text>

                  <View className="bg-white/5 rounded-2xl p-5 border border-white/10">
                    <Text className="text-muted text-xs font-bold uppercase mb-2">O que precisa ser feito?</Text>
                    <TextInput
                      className="text-foreground text-lg font-semibold"
                      placeholder="Ex: Comprar café, Estudar React..."
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      autoFocus
                      value={inputValue}
                      onChangeText={setInputValue}
                      onSubmitEditing={addTask}
                    />
                  </View>

                  <TouchableOpacity 
                    onPress={addTask}
                    className="bg-primary p-5 rounded-2xl items-center mt-8"
                  >
                    <Text className="text-white text-lg font-bold">Criar Tarefa</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setModalVisible(false)}
                    className="p-4 items-center mt-2"
                  >
                    <Text className="text-muted font-medium">Cancelar</Text>
                  </TouchableOpacity>
                </Pressable>
              </Animated.View>
            </Pressable>
          </KeyboardAvoidingView>
        </Modal>
      </ScreenContainer>
    </Animated.View>
  );
}
