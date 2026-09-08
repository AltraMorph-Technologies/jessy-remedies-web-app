import { HOME_BENEFITS } from '../constants';

export function BenefitsSection() {
  return (
    <section className="px-3 py-24 sm:px-5 lg:px-8">
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
            {HOME_BENEFITS.map(({ number, title, description }) => (
              <article key={number} className="bg-white p-5 sm:p-8">
                <span className="text-xs font-black tracking-[0.14em] text-[#26a785]">
                  {number}
                </span>
                <h3 className="mt-5 text-lg font-black tracking-[-0.03em]">
                  {title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[#66748e]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
