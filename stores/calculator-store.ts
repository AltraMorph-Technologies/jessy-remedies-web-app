import { create } from 'zustand';

export type ProductId = 'sme' | 'sme-plus' | 'employee' | 'special';

type CalculatorState = {
  amount: number;
  months: number;
  productId: ProductId;
  setAmount: (amount: number) => void;
  setMonths: (months: number) => void;
  setProductId: (productId: ProductId) => void;
};

export const useCalculatorStore = create<CalculatorState>((set) => ({
  amount: 500_000,
  months: 6,
  productId: 'sme',
  setAmount: (amount) => set({ amount }),
  setMonths: (months) => set({ months }),
  setProductId: (productId) =>
    set({
      productId,
      amount: productId === 'sme-plus' ? 1_000_000 : 500_000,
    }),
}));
