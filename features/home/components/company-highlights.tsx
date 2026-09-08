import { COMPANY_HIGHLIGHTS } from '../constants';

export function CompanyHighlights() {
  return (
    <section className="border-y border-[#101b36]/8 bg-white">
      <div className="mx-auto grid max-w-7xl gap-px bg-[#101b36]/8 sm:grid-cols-3">
        {COMPANY_HIGHLIGHTS.map(([value, label]) => (
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
  );
}
