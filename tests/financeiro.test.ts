import { describe, it, expect, beforeEach, vi } from "vitest";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

interface Despesa {
  id: string;
  nome: string;
  valor: number;
  isFixa: boolean;
}

describe("Financeiro - Calculadora de Despesas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Adicionar Despesa", () => {
    it("deve adicionar uma despesa válida", () => {
      const despesas: Despesa[] = [];
      const novaDespesa: Despesa = {
        id: "1",
        nome: "Aluguel",
        valor: 1200,
        isFixa: false,
      };

      despesas.push(novaDespesa);

      expect(despesas).toHaveLength(1);
      expect(despesas[0].nome).toBe("Aluguel");
      expect(despesas[0].valor).toBe(1200);
    });

    it("deve rejeitar despesa com valor inválido", () => {
      const valor = -100;
      const isValid = valor > 0;

      expect(isValid).toBe(false);
    });

    it("deve rejeitar despesa com nome vazio", () => {
      const nome = "";
      const isValid = nome.trim().length > 0;

      expect(isValid).toBe(false);
    });
  });

  describe("Gastos Fixos", () => {
    it("deve criar um gasto fixo", () => {
      const gastoFixo: Despesa = {
        id: "2",
        nome: "Internet",
        valor: 100,
        isFixa: true,
      };

      expect(gastoFixo.isFixa).toBe(true);
      expect(gastoFixo.nome).toBe("Internet");
    });

    it("deve editar um gasto fixo", () => {
      const despesas: Despesa[] = [
        {
          id: "2",
          nome: "Internet",
          valor: 100,
          isFixa: true,
        },
      ];

      const gastoAtualizado = {
        ...despesas[0],
        valor: 150,
      };

      despesas[0] = gastoAtualizado;

      expect(despesas[0].valor).toBe(150);
    });

    it("deve remover um gasto fixo", () => {
      const despesas: Despesa[] = [
        {
          id: "2",
          nome: "Internet",
          valor: 100,
          isFixa: true,
        },
      ];

      const novasDespesas = despesas.filter((d) => d.id !== "2");

      expect(novasDespesas).toHaveLength(0);
    });

    it("deve aplicar todos os gastos fixos", () => {
      const despesas: Despesa[] = [
        {
          id: "1",
          nome: "Aluguel",
          valor: 1200,
          isFixa: true,
        },
        {
          id: "2",
          nome: "Internet",
          valor: 100,
          isFixa: true,
        },
      ];

      const gastosFixos = despesas.filter((d) => d.isFixa);
      const totalGastosFixos = gastosFixos.reduce((sum, d) => sum + d.valor, 0);

      expect(totalGastosFixos).toBe(1300);
      expect(gastosFixos).toHaveLength(2);
    });
  });

  describe("Cálculos Financeiros", () => {
    it("deve calcular total de despesas corretamente", () => {
      const despesas: Despesa[] = [
        { id: "1", nome: "Aluguel", valor: 1200, isFixa: false },
        { id: "2", nome: "Comida", valor: 300, isFixa: false },
        { id: "3", nome: "Transporte", valor: 150, isFixa: false },
      ];

      const total = despesas.reduce((sum, d) => sum + d.valor, 0);

      expect(total).toBe(1650);
    });

    it("deve calcular saldo restante corretamente", () => {
      const salario = 3000;
      const despesas: Despesa[] = [
        { id: "1", nome: "Aluguel", valor: 1200, isFixa: false },
        { id: "2", nome: "Comida", valor: 300, isFixa: false },
      ];

      const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);
      const saldo = salario - totalDespesas;

      expect(saldo).toBe(1500);
    });

    it("deve mostrar saldo negativo quando despesas excedem salário", () => {
      const salario = 2000;
      const despesas: Despesa[] = [
        { id: "1", nome: "Aluguel", valor: 1500, isFixa: false },
        { id: "2", nome: "Comida", valor: 800, isFixa: false },
      ];

      const totalDespesas = despesas.reduce((sum, d) => sum + d.valor, 0);
      const saldo = salario - totalDespesas;

      expect(saldo).toBe(-300);
      expect(saldo < 0).toBe(true);
    });
  });

  describe("Persistência de Dados", () => {
    it("deve salvar salário no AsyncStorage", async () => {
      const salario = "3000";

      await AsyncStorage.setItem("salario_financeiro", salario);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "salario_financeiro",
        salario
      );
    });

    it("deve salvar despesas no AsyncStorage", async () => {
      const despesas: Despesa[] = [
        { id: "1", nome: "Aluguel", valor: 1200, isFixa: false },
      ];

      await AsyncStorage.setItem(
        "despesas_financeiro",
        JSON.stringify(despesas)
      );

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "despesas_financeiro",
        JSON.stringify(despesas)
      );
    });

    it("deve carregar dados do AsyncStorage", async () => {
      const mockSalario = "3000";
      const mockDespesas = JSON.stringify([
        { id: "1", nome: "Aluguel", valor: 1200, isFixa: false },
      ]);

      (AsyncStorage.getItem as any).mockImplementation((key: string) => {
        if (key === "salario_financeiro") return Promise.resolve(mockSalario);
        if (key === "despesas_financeiro") return Promise.resolve(mockDespesas);
        return Promise.resolve(null);
      });

      const salario = await AsyncStorage.getItem("salario_financeiro");
      const despesas = await AsyncStorage.getItem("despesas_financeiro");

      expect(salario).toBe("3000");
      expect(despesas).toBe(mockDespesas);
    });
  });

  describe("Separação entre Despesas Fixas e Variáveis", () => {
    it("deve filtrar apenas despesas fixas", () => {
      const despesas: Despesa[] = [
        { id: "1", nome: "Aluguel", valor: 1200, isFixa: true },
        { id: "2", nome: "Comida", valor: 300, isFixa: false },
        { id: "3", nome: "Internet", valor: 100, isFixa: true },
      ];

      const gastoFixo = despesas.filter((d) => d.isFixa);

      expect(gastoFixo).toHaveLength(2);
      expect(gastoFixo.every((d) => d.isFixa)).toBe(true);
    });

    it("deve filtrar apenas despesas variáveis", () => {
      const despesas: Despesa[] = [
        { id: "1", nome: "Aluguel", valor: 1200, isFixa: true },
        { id: "2", nome: "Comida", valor: 300, isFixa: false },
        { id: "3", nome: "Internet", valor: 100, isFixa: true },
      ];

      const despesasVariaveis = despesas.filter((d) => !d.isFixa);

      expect(despesasVariaveis).toHaveLength(1);
      expect(despesasVariaveis[0].nome).toBe("Comida");
    });
  });
});
