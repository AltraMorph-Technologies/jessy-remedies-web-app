'use client';

import { InputNumber, Select, Slider } from 'antd';
import { useCalculatorStore, type ProductId } from '../stores/calculator-store';

const products = {
  sme: { label: 'SME loan up to ₦500k', rate: 0.04, method: 'flat' },
  'sme-plus': { label: 'SME loan above ₦500k', rate: 0.05, method: 'flat' },
  employee: { label: 'Employee loan', rate: 0.05, method: 'flat' },
  special: { label: 'Special loan', rate: 0.1, method: 'reducing' },
} as const;

const currency = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function LoanCalculator() {
  const { amount, months, productId, setAmount, setMonths, setProductId } =
    useCalculatorStore();
  const product = products[productId];

  let totalInterest = 0;
  if (product.method === 'flat') {
    totalInterest = amount * product.rate * months;
  } else {
    const principalPayment = amount / months;
    for (let month = 0; month < months; month += 1) {
      totalInterest += (amount - principalPayment * month) * product.rate;
    }
  }

  const totalRepayment = amount + totalInterest;
  const monthlyPayment = totalRepayment / months;
  const maxAmount = productId === 'sme' ? 500_000 : 5_000_000;
  const minAmount = productId === 'sme-plus' ? 500_000 : 50_000;

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[1.75rem] border border-[#101b36]/8 bg-white p-6 shadow-[0_20px_60px_rgba(16,27,54,0.07)] sm:p-8">
        <label
          className="text-xs font-bold tracking-[0.12em] text-[#71809a] uppercase"
          htmlFor="loan-product"
        >
          Loan product
        </label>
        <Select
          id="loan-product"
          className="mt-2 w-full"
          size="large"
          value={productId}
          onChange={(value: ProductId) => setProductId(value)}
          options={Object.entries(products).map(([value, item]) => ({
            value,
            label: item.label,
          }))}
        />

        <div className="mt-7 flex items-center justify-between gap-4">
          <label
            className="text-xs font-bold tracking-[0.12em] text-[#71809a] uppercase"
            htmlFor="loan-amount"
          >
            Loan amount
          </label>
          <InputNumber
            id="loan-amount"
            min={minAmount}
            max={maxAmount}
            step={50_000}
            value={amount}
            controls={false}
            formatter={(value) =>
              `₦ ${Number(value ?? 0).toLocaleString('en-NG')}`
            }
            parser={(value) => Number(value?.replace(/₦\s?|,/g, '') ?? 0)}
            onChange={(value) => setAmount(Number(value ?? minAmount))}
          />
        </div>
        <Slider
          min={minAmount}
          max={maxAmount}
          step={50_000}
          value={amount}
          tooltip={{ formatter: (value) => currency.format(value ?? 0) }}
          onChange={setAmount}
        />

        <div className="mt-7 flex items-center justify-between gap-4">
          <label
            className="text-xs font-bold tracking-[0.12em] text-[#71809a] uppercase"
            htmlFor="loan-duration"
          >
            Duration
          </label>
          <strong className="text-sm text-[#101b36]">{months} months</strong>
        </div>
        <Slider
          id="loan-duration"
          min={1}
          max={12}
          step={1}
          value={months}
          onChange={setMonths}
        />

        <div className="mt-6 rounded-2xl bg-[#eef7f4] p-4 text-sm leading-6 text-[#236d63]">
          {product.method === 'flat'
            ? `${product.rate * 100}% flat monthly interest is calculated on the original principal.`
            : `${product.rate * 100}% monthly interest is calculated on the outstanding balance.`}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[1.75rem] bg-[#101b36] p-6 text-white shadow-[0_24px_70px_rgba(16,27,54,0.18)] sm:p-8">
        <div
          className="absolute -top-20 -right-20 h-64 w-64 rounded-full border-[42px] border-white/5"
          aria-hidden="true"
        />
        <p className="text-xs font-bold tracking-[0.14em] text-white/55 uppercase">
          Your estimated repayment
        </p>
        <div className="relative mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/8 p-5">
            <p className="text-xs font-bold tracking-[0.1em] text-white/55 uppercase">
              Monthly payment
            </p>
            <p className="mt-2 text-3xl font-black tracking-[-0.05em]">
              {currency.format(monthlyPayment)}
            </p>
          </div>
          <div className="rounded-2xl bg-[#236d63] p-5">
            <p className="text-xs font-bold tracking-[0.1em] text-white/65 uppercase">
              Total repayment
            </p>
            <p className="mt-2 text-3xl font-black tracking-[-0.05em]">
              {currency.format(totalRepayment)}
            </p>
          </div>
        </div>
        <div className="relative mt-4 flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4">
          <span className="text-sm text-white/60">
            Estimated total interest
          </span>
          <strong>{currency.format(totalInterest)}</strong>
        </div>
        <p className="relative mt-5 max-w-xl text-xs leading-5 text-white/45">
          This estimate is for guidance only. Final terms depend on
          verification, eligibility and the approved loan agreement.
        </p>
        <a
          href="#apply"
          className="relative mt-7 inline-flex rounded-xl bg-[#f0b44d] px-6 py-3.5 text-sm font-black text-[#101b36] transition hover:bg-[#f5c469]"
        >
          Continue to apply →
        </a>
      </div>
    </div>
  );
}
