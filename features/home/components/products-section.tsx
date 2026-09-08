import { LOAN_PRODUCTS } from '../constants';

export function ProductsSection() {
  return (
    <section id="products" className="scroll-mt-24 px-3 py-24 sm:px-5 lg:px-8">
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
            {LOAN_PRODUCTS.map((product) => (
              <article
                key={product.name}
                className="group rounded-[1.5rem] border border-[#101b36]/8 bg-white p-4 transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(16,27,54,0.09)] sm:rounded-[1.75rem] sm:p-7"
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
  );
}
