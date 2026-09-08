export function ApplicationCta() {
  return (
    <section id="apply" className="scroll-mt-20 px-3 pb-24 sm:px-5 lg:px-8">
      <div className="relative mx-auto overflow-hidden rounded-[1.5rem] bg-[#236d63] px-4 py-10 text-white sm:rounded-[2rem] sm:px-10 sm:py-12 lg:grid lg:max-w-7xl lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12 lg:px-14 lg:py-16">
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
            className="flex items-center justify-between rounded-2xl bg-white px-6 py-5 font-black !text-[#236d63] transition hover:-translate-y-0.5"
          >
            Chat with the loan desk <span>↗</span>
          </a>
          <a
            href="tel:+2348034770629"
            className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/8 px-6 py-5 font-black !text-white transition hover:bg-white/12"
          >
            Call +234 803 477 0629 <span>→</span>
          </a>
          <p className="mt-2 text-xs leading-5 text-white/50">
            Never send passwords, PINs or card details through WhatsApp or phone
            calls.
          </p>
        </div>
      </div>
    </section>
  );
}
