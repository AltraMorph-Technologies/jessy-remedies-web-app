'use client';

import Link from './app-link';
import { useState } from 'react';

const links = [
  ['Products', '#products'],
  ['Calculator', '#calculator'],
  ['About', '#about'],
  ['How it works', '#process'],
  ['Contact', '#contact'],
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#101b36]/8 bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-3 sm:px-5 lg:px-8">
        <a
          href="#top"
          className="flex items-center gap-3"
          aria-label="Jesse Remedies home"
        >
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#173a76] text-base font-black tracking-[-0.08em] text-white shadow-sm">
            JR
          </span>
          <span>
            <strong className="block text-base leading-none tracking-[-0.02em] text-[#101b36]">
              Jesse Remedies
            </strong>
            <span className="mt-1 block text-[11px] font-semibold tracking-[0.16em] text-[#60708f] uppercase">
              Simple · Fast · Fair
            </span>
          </span>
        </a>

        <nav
          className="hidden items-center gap-7 text-sm font-semibold text-[#52617d] lg:flex"
          aria-label="Main navigation"
        >
          {links.map(([label, href]) => (
            <a
              key={href}
              className="transition hover:text-[#173a76]"
              href={href}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden px-2 py-3 text-sm font-bold text-[#173a76] transition hover:text-[#236d63] sm:block"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="hidden rounded-xl !border-0 !bg-[#173a76] px-5 py-3 text-sm font-bold !text-white !shadow-none transition hover:-translate-y-0.5 hover:!bg-[#102c5e] sm:block"
          >
            Apply now
          </Link>
          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-xl border border-[#101b36]/10 text-xl text-[#101b36] lg:hidden"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? '×' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="border-t border-[#101b36]/8 bg-white px-3 py-5 sm:px-5 lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 font-semibold text-[#52617d] hover:bg-[#f5f7fb]"
              >
                {label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 font-semibold text-[#173a76] hover:bg-[#f5f7fb] sm:hidden"
            >
              Login
            </Link>
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-xl !border-0 !bg-[#173a76] px-4 py-3 text-center font-bold !text-white !shadow-none sm:hidden"
            >
              Apply now
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
