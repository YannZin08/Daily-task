import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Task } from "@/lib/task-types";
import { useSettings } from "@/lib/settings-provider";

interface TaskItemProps {
  task: Task;
  index: number;
  colors: any;
  onToggle: () => void;
  onDelete: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onAddSubtask: (texto: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

export function TaskItem({
  task,
  index,
  colors,
  onToggle,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
}: TaskItemProps) {
  const { t } = useSettings();
  const [expanded, setExpanded] = useState(false);
  const [novoPasso, setNovoPasso] = useState("");

  const subtasks = task.subtasks || [];
  const concluidos = subtasks.filter((s) => s.concluida).length;

  const confirmarNovoPasso = () => {
    if (!novoPasso.trim()) return;
    onAddSubtask(novoPasso.trim());
    setNovoPasso("");
  };

  return (
    <Animated.View
      entering={FadeInUp.delay(100 * index).duration(400)}
      layout={Layout.springify()}
      className={`bg-surface p-5 rounded-[24px] mb-4 border border-white/5 ${task.completed ? "opacity-60" : ""}`}
    >
      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={onToggle}
          className={`w-7 h-7 rounded-xl items-center justify-center border-2 ${task.completed ? "bg-primary border-primary" : "border-white/20"}`}
        >
          {task.completed && <IconSymbol name="check" size={16} color="#FFF" />}
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 mx-4" onPress={() => setExpanded((e) => !e)} activeOpacity={0.7}>
          <Text className={`text-base font-semibold ${task.completed ? "text-muted line-through" : "text-foreground"}`}>
            {task.title}
          </Text>
          {subtasks.length > 0 && (
            <Text className="text-muted text-xs font-medium mt-1">
              {concluidos}/{subtasks.length} {t("tasks.steps")}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setExpanded((e) => !e)} className="p-2">
          <IconSymbol
            name="chevron.right"
            size={18}
            color={colors.muted}
            style={{ transform: [{ rotate: expanded ? "90deg" : "0deg" }] }}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={onDelete} className="p-2">
          <IconSymbol name="trash" size={20} color={colors.error} />
        </TouchableOpacity>
      </View>

      {expanded && (
        <View className="mt-4 pt-4 border-t border-white/10">
          {subtasks.map((sub) => (
            <View key={sub.id} className="flex-row items-center mb-3">
              <TouchableOpacity
                onPress={() => onToggleSubtask(sub.id)}
                className={`w-5 h-5 rounded-md items-center justify-center border-2 mr-3 ${sub.concluida ? "bg-accent border-accent" : "border-white/20"}`}
              >
                {sub.concluida && <IconSymbol name="check" size={12} color="#FFF" />}
              </TouchableOpacity>
              <Text className={`flex-1 text-sm ${sub.concluida ? "text-muted line-through" : "text-foreground"}`}>
                {sub.texto}
              </Text>
              <TouchableOpacity onPress={() => onDeleteSubtask(sub.id)} className="p-1">
                <IconSymbol name="plus" size={14} color={colors.muted} style={{ transform: [{ rotate: "45deg" }] }} />
              </TouchableOpacity>
            </View>
          ))}

          <View className="flex-row items-center mt-1">
            <TextInput
              value={novoPasso}
              onChangeText={setNovoPasso}
              placeholder={t("tasks.addStepPlaceholder")}
              placeholderTextColor={colors.muted}
              onSubmitEditing={confirmarNovoPasso}
              returnKeyType="done"
              style={{
                flex: 1,
                backgroundColor: colors.background,
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                color: colors.foreground,
                borderWidth: 1,
                borderColor: colors.border,
                fontSize: 14,
              }}
            />
            <TouchableOpacity onPress={confirmarNovoPasso} className="ml-2 p-2">
              <IconSymbol name="plus" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Animated.View>
  );
}
