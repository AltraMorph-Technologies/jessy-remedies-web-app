import { FaqList } from '@/components/faq-list';

export function FaqSection() {
  return (
    <section className="px-3 py-24 sm:px-5 lg:px-8">
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
  );
}
