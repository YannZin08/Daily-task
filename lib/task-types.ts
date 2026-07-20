export interface Subtask {
  id: string;
  texto: string;
  concluida: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  subtasks?: Subtask[];
}
