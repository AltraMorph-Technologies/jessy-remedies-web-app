import { COMPANY_VALUES } from '../constants';

export function AboutSection() {
  return (
    <section
      id="about"
      className="scroll-mt-20 bg-[#101b36] px-3 py-24 text-white sm:px-5 lg:px-8"
    >
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative min-h-[430px] overflow-hidden rounded-[1.5rem] bg-[#173a76] p-5 sm:rounded-[2rem] sm:p-10">
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
            teamwork—with the goal of helping customers strengthen their income,
            businesses and financial independence.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            {COMPANY_VALUES.map((value) => (
              <span
                key={value}
                className="rounded-full border border-white/12 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
