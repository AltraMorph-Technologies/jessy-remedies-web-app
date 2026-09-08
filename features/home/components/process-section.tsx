import { APPLICATION_STEPS } from '../constants';

export function ProcessSection() {
  return (
    <section
      id="process"
      className="scroll-mt-20 bg-white px-3 py-24 sm:px-5 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="eyebrow">How it works</p>
          <h2 className="section-title mt-4">
            From enquiry to funding in four clear steps.
          </h2>
        </div>
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {APPLICATION_STEPS.map(({ title, description }, index) => (
            <article
              key={title}
              className="relative rounded-[1.5rem] border border-[#101b36]/8 bg-[#f7f8fb] p-4 sm:p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#173a76] text-sm font-black text-white">
                {index + 1}
              </span>
              <h3 className="mt-6 text-lg font-black tracking-[-0.03em]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#66748e]">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
