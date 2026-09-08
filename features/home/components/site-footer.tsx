import { CONTACT_LINKS, FOOTER_LINKS } from '../constants';

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="scroll-mt-20 border-t border-[#101b36]/8 bg-white px-3 pt-16 sm:px-5 lg:px-8"
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
            {CONTACT_LINKS.map(({ label, href }) => (
              <a key={href} className="block hover:text-[#173a76]" href={href}>
                {label}
              </a>
            ))}
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
          {FOOTER_LINKS.map((label) => (
            <a key={label} href="#contact">
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
