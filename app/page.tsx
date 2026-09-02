import Link from 'next/link';
import { FaqList } from '../components/faq-list';
import { LoanCalculator } from '../components/loan-calculator';
import { SiteHeader } from '../components/site-header';

const assurances = [
  'Clear repayment breakdown',
  'Flexible loan products',
  'Local support in Lagos',
];

const products = [
  {
    number: '01',
    name: 'Business Loan',
    description:
      'Working capital for stock, equipment and the everyday needs that keep your business moving.',
    details: [
      'Up to ₦500k: 4% monthly flat',
      'Above ₦500k: 5% monthly flat',
      'Monthly repayment',
    ],
    tone: 'bg-[#e9f7f3] text-[#236d63]',
  },
  {
    number: '02',
    name: 'Weekly Business Loan',
    description:
      'A short-cycle option for traders and businesses whose cash flow works better week by week.',
    details: [
      '4% indicative rate',
      'Weekly repayment',
      'Business verification',
    ],
    tone: 'bg-[#edf2fb] text-[#173a76]',
  },
  {
    number: '03',
    name: 'Employee Loan',
    description:
      'Predictable monthly support for salaried employees handling planned or unexpected expenses.',
    details: ['5% monthly flat', 'Monthly repayment', 'Income verification'],
    tone: 'bg-[#fff5df] text-[#8f6317]',
  },
  {
    number: '04',
    name: 'Special Loan',
    description:
      'A reducing-balance option for eligible borrowers with repayment needs outside standard products.',
    details: [
      '10% reducing balance',
      'Variable monthly interest',
      'Eligibility review',
    ],
    tone: 'bg-[#f5edfb] text-[#71448f]',
  },
];

const benefits = [
  [
    '01',
    'See the numbers first',
    'Use the calculator to understand the estimated interest, instalment and total repayment before you apply.',
  ],
  [
    '02',
    'A product that fits',
    'Choose between employee, monthly business, weekly business and special loan options.',
  ],
  [
    '03',
    'People you can reach',
    'Speak with a local loan officer by phone, WhatsApp or at the Egbeda office.',
  ],
  [
    '04',
    'A guided process',
    'From verification to approval, each step and requirement is clearly explained.',
  ],
];

const steps = [
  [
    'Tell us what you need',
    'Select a product, calculate your estimate and contact our loan desk to begin.',
  ],
  [
    'Complete verification',
    'Provide the required identification, income or business information for review.',
  ],
  [
    'Receive a decision',
    'We assess affordability and eligibility, then communicate the approved terms clearly.',
  ],
  [
    'Get funded',
    'After acceptance and final verification, successful loans are prepared for disbursement.',
  ],
];

export default function Home() {
  return (
    <main
      id="top"
      className="min-h-screen overflow-hidden bg-[#f7f8fb] text-[#101b36]"
    >
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#f7f8fb]">
        <div
          className="hero-grid absolute inset-0 opacity-55"
          aria-hidden="true"
        />
        <div
          className="absolute top-0 -right-24 h-96 w-96 rounded-full bg-[#50c3af]/15 blur-3xl"
          aria-hidden="true"
        />
        <div className="mx-auto grid min-h-[690px] max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
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
              Transparent loans for employees and growing businesses, with a
              clear repayment plan before you apply.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="#calculator"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#173a76] px-6 py-4 text-sm font-bold text-white shadow-[0_14px_30px_rgba(23,58,118,0.2)] transition hover:-translate-y-0.5 hover:bg-[#102c5e]"
              >
                Calculate repayment <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="#products"
                className="inline-flex items-center justify-center rounded-xl border border-[#101b36]/12 bg-white px-6 py-4 text-sm font-bold text-[#173a76] transition hover:border-[#173a76]/30"
              >
                Explore loan products
              </Link>
            </div>
            <ul className="mt-9 flex flex-col gap-3 text-sm font-semibold text-[#52617d] sm:flex-row sm:flex-wrap sm:gap-x-6">
              {assurances.map((item) => (
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
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_32px_90px_rgba(16,27,54,0.14)] sm:p-8">
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
              <Link
                href="#calculator"
                className="mt-6 flex items-center justify-between rounded-xl bg-[#e9f7f3] px-5 py-4 text-sm font-bold text-[#236d63] transition hover:bg-[#ddf1eb]"
              >
                Try your own amount <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#101b36]/8 bg-white">
        <div className="mx-auto grid max-w-7xl gap-px bg-[#101b36]/8 sm:grid-cols-3">
          {[
            ['Since 2020', 'Helping individuals and businesses move forward'],
            ['Lagos based', 'A local team you can speak with'],
            ['24–48 hours', 'Typical processing after successful verification'],
          ].map(([value, label]) => (
            <div
              key={value}
              className="bg-white px-6 py-7 text-center sm:text-left"
            >
              <strong className="text-xl font-black tracking-[-0.04em] text-[#173a76]">
                {value}
              </strong>
              <p className="mt-1 text-sm leading-6 text-[#66748e]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="products" className="scroll-mt-24 px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="eyebrow">Loan products</p>
              <h2 className="section-title mt-4">
                A practical option for every kind of next step.
              </h2>
              <p className="section-copy mt-5">
                Compare the repayment style, then use the calculator to see what
                the numbers could look like for you.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {products.map((product) => (
                <article
                  key={product.name}
                  className="group rounded-[1.75rem] border border-[#101b36]/8 bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(16,27,54,0.09)] sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-2xl text-xs font-black ${product.tone}`}
                    >
                      {product.number}
                    </span>
                    <span className="text-xl text-[#173a76] transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl font-black tracking-[-0.04em]">
                    {product.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#66748e]">
                    {product.description}
                  </p>
                  <ul className="mt-5 space-y-2 border-t border-[#101b36]/8 pt-5 text-sm font-semibold text-[#52617d]">
                    {product.details.map((detail) => (
                      <li key={detail} className="flex gap-2">
                        <span className="text-[#26a785]">✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="calculator"
        className="scroll-mt-20 bg-white px-5 py-24 lg:px-8"
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

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <p className="eyebrow">Why Jesse Remedies</p>
              <h2 className="section-title mt-4">
                Finance should feel clear—not intimidating.
              </h2>
              <p className="section-copy mt-5">
                We combine straightforward information, flexible products and a
                local team to create a more human lending experience.
              </p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-[1.75rem] border border-[#101b36]/8 bg-[#101b36]/8 sm:grid-cols-2">
              {benefits.map(([number, title, copy]) => (
                <article key={number} className="bg-white p-7 sm:p-8">
                  <span className="text-xs font-black tracking-[0.14em] text-[#26a785]">
                    {number}
                  </span>
                  <h3 className="mt-5 text-lg font-black tracking-[-0.03em]">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#66748e]">
                    {copy}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="about"
        className="scroll-mt-20 bg-[#101b36] px-5 py-24 text-white lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] bg-[#173a76] p-8 sm:p-10">
            <div
              className="absolute -right-20 -bottom-24 h-80 w-80 rounded-full border-[55px] border-white/5"
              aria-hidden="true"
            />
            <div className="relative flex h-full min-h-[350px] flex-col justify-between">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-xl font-black tracking-[-0.08em] text-[#173a76]">
                JR
              </div>
              <blockquote className="max-w-md text-3xl leading-tight font-black tracking-[-0.05em] sm:text-4xl">
                “Financial support should open doors, not create confusion.”
              </blockquote>
              <p className="text-sm font-semibold text-white/55">
                Jesse Remedies Nigeria Limited
              </p>
            </div>
          </div>
          <div>
            <p className="eyebrow text-[#65d3bd]">About us</p>
            <h2 className="mt-4 text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.98] font-black tracking-[-0.055em]">
              A trusted partner in financial empowerment.
            </h2>
            <p className="mt-7 text-base leading-8 text-white/65">
              Jesse Remedies Nigeria Limited was established in 2020 to provide
              accessible loan services for individuals and economically active
              businesses in Lagos.
            </p>
            <p className="mt-5 text-base leading-8 text-white/65">
              Our work is guided by service, innovation, integrity and
              teamwork—with the goal of helping customers strengthen their
              income, businesses and financial independence.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              {['Integrity', 'Swift service', 'Innovation', 'Teamwork'].map(
                (value) => (
                  <span
                    key={value}
                    className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75"
                  >
                    {value}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        id="process"
        className="scroll-mt-20 bg-white px-5 py-24 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="eyebrow">How it works</p>
            <h2 className="section-title mt-4">
              From enquiry to funding in four clear steps.
            </h2>
          </div>
          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(([title, copy], index) => (
              <article
                key={title}
                className="relative rounded-[1.5rem] border border-[#101b36]/8 bg-[#f7f8fb] p-6"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#173a76] text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-6 text-lg font-black tracking-[-0.03em]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#66748e]">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="eyebrow">Frequently asked</p>
            <h2 className="section-title mt-4">
              A few things borrowers usually want to know.
            </h2>
          </div>
          <FaqList />
        </div>
      </section>

      <section id="apply" className="scroll-mt-20 px-5 pb-24 lg:px-8">
        <div className="relative mx-auto overflow-hidden rounded-[2rem] bg-[#236d63] px-6 py-12 text-white sm:px-10 lg:grid lg:max-w-7xl lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:px-14 lg:py-16">
          <div
            className="absolute -top-28 -right-28 h-96 w-96 rounded-full border-[60px] border-white/5"
            aria-hidden="true"
          />
          <div className="relative">
            <p className="text-xs font-black tracking-[0.16em] text-[#a8eadc] uppercase">
              Ready to take the next step?
            </p>
            <h2 className="mt-4 max-w-2xl text-[clamp(2.5rem,5vw,4.6rem)] leading-[0.96] font-black tracking-[-0.055em]">
              Start with a conversation.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/70">
              Our loan desk will explain the requirements, confirm the right
              product and guide you through the application.
            </p>
          </div>
          <div className="relative mt-9 grid gap-3 lg:mt-0">
            <a
              href="https://wa.me/2347074126493"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-2xl bg-white px-6 py-5 font-black text-[#236d63] transition hover:-translate-y-0.5"
            >
              Chat with the loan desk <span>↗</span>
            </a>
            <a
              href="tel:+2348034770629"
              className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/8 px-6 py-5 font-black text-white transition hover:bg-white/12"
            >
              Call +234 803 477 0629 <span>→</span>
            </a>
            <p className="mt-2 text-xs leading-5 text-white/50">
              Never send passwords, PINs or card details through WhatsApp or
              phone calls.
            </p>
          </div>
        </div>
      </section>

      <footer
        id="contact"
        className="scroll-mt-20 border-t border-[#101b36]/8 bg-white px-5 pt-16 lg:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-12 pb-14 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.9fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#173a76] text-base font-black tracking-[-0.08em] text-white">
                JR
              </span>
              <strong className="text-lg tracking-[-0.03em]">
                Jesse Remedies
              </strong>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#66748e]">
              Accessible, transparent loan support for employees and growing
              businesses in Lagos.
            </p>
          </div>
          <div>
            <p className="footer-title">Visit us</p>
            <address className="mt-4 text-sm leading-7 text-[#66748e] not-italic">
              2 Mokola Plaza,
              <br />
              Egbeda Idimu Road,
              <br />
              Egbeda Bus Stop, Lagos
            </address>
          </div>
          <div>
            <p className="footer-title">Contact</p>
            <div className="mt-4 space-y-2 text-sm text-[#66748e]">
              <a
                className="block hover:text-[#173a76]"
                href="tel:+2348034770629"
              >
                +234 803 477 0629
              </a>
              <a
                className="block hover:text-[#173a76]"
                href="tel:+2347025348787"
              >
                +234 702 534 8787
              </a>
              <a
                className="block hover:text-[#173a76]"
                href="mailto:info@jesseremedies.com"
              >
                info@jesseremedies.com
              </a>
            </div>
          </div>
          <div>
            <p className="footer-title">Opening hours</p>
            <p className="mt-4 text-sm leading-7 text-[#66748e]">
              Monday – Friday
              <br />
              8:00am – 5:00pm
            </p>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl flex-col gap-3 border-t border-[#101b36]/8 py-6 text-xs text-[#7a879e] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Jesse Remedies Nigeria Limited. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="#contact">Privacy enquiries</Link>
            <Link href="#contact">Terms enquiries</Link>
            <Link href="#contact">Complaints</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
