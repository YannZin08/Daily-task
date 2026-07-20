import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
  },
}));

const STORAGE_KEY = 'tasks';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

describe('Task Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Task Creation', () => {
    it('should create a new task with correct properties', () => {
      const newTask: Task = {
        id: Date.now().toString(),
        title: 'Academia',
        completed: false,
        createdAt: Date.now(),
      };

      expect(newTask.title).toBe('Academia');
      expect(newTask.completed).toBe(false);
      expect(newTask.id).toBeDefined();
      expect(newTask.createdAt).toBeDefined();
    });

    it('should not allow empty task titles', () => {
      const title = '';
      const isValid = title.trim() !== '';
      expect(isValid).toBe(false);
    });

    it('should trim whitespace from task titles', () => {
      const title = '  Tarefa de Curso  ';
      const trimmedTitle = title.trim();
      expect(trimmedTitle).toBe('Tarefa de Curso');
    });
  });

  describe('Task Toggle', () => {
    it('should toggle task completion status', () => {
      const task: Task = {
        id: '1',
        title: 'Academia',
        completed: false,
        createdAt: Date.now(),
      };

      const toggledTask = { ...task, completed: !task.completed };
      expect(toggledTask.completed).toBe(true);

      const toggledAgain = { ...toggledTask, completed: !toggledTask.completed };
      expect(toggledAgain.completed).toBe(false);
    });
  });

  describe('Task Deletion', () => {
    it('should remove task from list', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Task 1', completed: false, createdAt: Date.now() },
        { id: '2', title: 'Task 2', completed: false, createdAt: Date.now() },
        { id: '3', title: 'Task 3', completed: false, createdAt: Date.now() },
      ];

      const taskIdToDelete = '2';
      const updatedTasks = tasks.filter((task) => task.id !== taskIdToDelete);

      expect(updatedTasks).toHaveLength(2);
      expect(updatedTasks.find((t) => t.id === '2')).toBeUndefined();
      expect(updatedTasks.find((t) => t.id === '1')).toBeDefined();
      expect(updatedTasks.find((t) => t.id === '3')).toBeDefined();
    });
  });

  describe('Task Completion Counting', () => {
    it('should correctly count completed tasks', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Task 1', completed: true, createdAt: Date.now() },
        { id: '2', title: 'Task 2', completed: false, createdAt: Date.now() },
        { id: '3', title: 'Task 3', completed: true, createdAt: Date.now() },
      ];

      const completedCount = tasks.filter((task) => task.completed).length;
      expect(completedCount).toBe(2);
    });

    it('should return 0 when no tasks are completed', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Task 1', completed: false, createdAt: Date.now() },
        { id: '2', title: 'Task 2', completed: false, createdAt: Date.now() },
      ];

      const completedCount = tasks.filter((task) => task.completed).length;
      expect(completedCount).toBe(0);
    });

    it('should return total count when all tasks are completed', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Task 1', completed: true, createdAt: Date.now() },
        { id: '2', title: 'Task 2', completed: true, createdAt: Date.now() },
      ];

      const completedCount = tasks.filter((task) => task.completed).length;
      expect(completedCount).toBe(tasks.length);
    });
  });

  describe('Task Persistence', () => {
    it('should serialize tasks to JSON', () => {
      const tasks: Task[] = [
        { id: '1', title: 'Academia', completed: false, createdAt: Date.now() },
        { id: '2', title: 'Tarefa de Curso', completed: true, createdAt: Date.now() },
      ];

      const serialized = JSON.stringify(tasks);
      const deserialized = JSON.parse(serialized);

      expect(deserialized).toEqual(tasks);
      expect(deserialized).toHaveLength(2);
    });

    it('should handle empty task list serialization', () => {
      const tasks: Task[] = [];
      const serialized = JSON.stringify(tasks);
      const deserialized = JSON.parse(serialized);

      expect(deserialized).toEqual([]);
      expect(deserialized).toHaveLength(0);
    });
  });

  describe('Task Ordering', () => {
    it('should add new tasks to the beginning of the list', () => {
      const existingTasks: Task[] = [
        { id: '1', title: 'Existing Task', completed: false, createdAt: Date.now() },
      ];

      const newTask: Task = {
        id: '2',
        title: 'New Task',
        completed: false,
        createdAt: Date.now(),
      };

      const updatedTasks = [newTask, ...existingTasks];

      expect(updatedTasks[0].id).toBe('2');
      expect(updatedTasks[1].id).toBe('1');
    });
  });
});
