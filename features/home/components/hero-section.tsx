import { HOME_ASSURANCES } from '../constants';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#f7f8fb]">
      <div
        className="hero-grid absolute inset-0 opacity-55"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 -right-24 h-96 w-96 rounded-full bg-[#50c3af]/15 blur-3xl"
        aria-hidden="true"
      />
      <div className="mx-auto grid min-h-[690px] max-w-7xl items-center gap-14 px-3 py-20 sm:px-5 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#173a76]/10 bg-white px-4 py-2 text-xs font-bold tracking-[0.13em] text-[#173a76] uppercase shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#26a785]" />
            Loans built around real life
          </span>
          <h1 className="mt-7 text-[clamp(3.2rem,7vw,6.4rem)] leading-[0.92] font-black tracking-[-0.065em] text-[#101b36]">
            Your next move,
            <span className="block text-[#236d63]">made possible.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-[#52617d]">
            Transparent loans for employees and growing businesses, with a clear
            repayment plan before you apply.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#calculator"
              className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#173a76] px-6 py-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(23,58,118,0.2)] transition hover:-translate-y-0.5 hover:bg-[#102c5e]"
            >
              Calculate repayment <span aria-hidden="true">→</span>
            </a>
            <a
              href="#products"
              className="inline-flex items-center justify-center rounded-xl border border-[#101b36]/12 bg-white px-6 py-4 text-sm font-bold text-[#173a76] transition hover:border-[#173a76]/30"
            >
              Explore loan products
            </a>
          </div>
          <ul className="mt-9 flex flex-col gap-3 text-sm font-semibold text-[#52617d] sm:flex-row sm:flex-wrap sm:gap-x-6">
            {HOME_ASSURANCES.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span
                  className="grid h-4 w-4 place-items-center rounded-full bg-[#26a785] text-[10px] text-white"
                  aria-hidden="true"
                >
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 mx-auto w-full max-w-[520px] lg:ml-auto">
          <div
            className="absolute -top-9 -left-9 h-32 w-32 rounded-[2rem] bg-[#f0b44d]"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/80 bg-white p-4 shadow-[0_32px_90px_rgba(16,27,54,0.14)] sm:rounded-[2rem] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-[#71809a] uppercase">
                  Repayment preview
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  Know before you apply
                </h2>
              </div>
              <span className="rounded-full bg-[#e9f7f3] px-3 py-1.5 text-xs font-bold text-[#236d63]">
                4% flat rate
              </span>
            </div>
            <div className="mt-8 rounded-2xl bg-[#f5f7fb] p-5">
              <div className="flex items-center justify-between text-sm text-[#66748e]">
                <span>Loan amount</span>
                <strong className="text-[#101b36]">₦500,000</strong>
              </div>
              <div className="mt-5 h-2 rounded-full bg-[#dfe5ef]">
                <div className="h-full w-3/4 rounded-full bg-[#236d63]" />
              </div>
              <div className="mt-6 flex items-center justify-between text-sm text-[#66748e]">
                <span>Duration</span>
                <strong className="text-[#101b36]">6 months</strong>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#101b36]/8 p-5">
                <p className="text-xs font-bold tracking-[0.1em] text-[#7a879e] uppercase">
                  Monthly payment
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  ₦103,333.33
                </p>
              </div>
              <div className="rounded-2xl bg-[#173a76] p-5 text-white">
                <p className="text-xs font-bold tracking-[0.1em] text-white/65 uppercase">
                  Total repayment
                </p>
                <p className="mt-2 text-2xl font-black tracking-[-0.04em]">
                  ₦620,000
                </p>
              </div>
            </div>
            <a
              href="#calculator"
              className="mt-6 flex items-center justify-between rounded-xl bg-[#173a76] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#102f65]"
            >
              Try your own amount <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
