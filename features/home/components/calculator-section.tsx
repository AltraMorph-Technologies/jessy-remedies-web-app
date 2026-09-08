import { LoanCalculator } from '@/components/loan-calculator';

export function CalculatorSection() {
  return (
    <section
      id="calculator"
      className="scroll-mt-20 bg-white px-3 py-24 sm:px-5 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="eyebrow">Loan calculator</p>
          <h2 className="section-title mt-4">See your repayment clearly.</h2>
          <p className="section-copy mt-5">
            Choose a product, amount and duration to receive an instant
            estimate.
          </p>
        </div>
        <LoanCalculator />
      </div>
    </section>
  );
}
