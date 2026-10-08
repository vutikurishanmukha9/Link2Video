import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQS } from "@/lib/seo-schema";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((cur) => (cur === idx ? null : idx));
  };

  return (
    <section id="faq" aria-labelledby="faq-title" className="shell mt-12 scroll-mt-16 sm:mt-16">
      <div className="mx-auto max-w-[760px]">
        {/* Centered Section Header */}
        <div className="text-center pb-6 border-b border-border">
          <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-surface-sunken px-3 py-1 text-[11px] font-medium text-text-muted">
            <HelpCircle size={13} className="text-accent" aria-hidden="true" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 id="faq-title" className="display-tight mt-3 text-[26px] sm:text-[32px] text-text">
            Frequently asked questions
          </h2>
          <p className="mt-2 text-[14px] text-text-secondary">
            Everything you need to know about downloading videos and audio safely and freely.
          </p>
        </div>

        {/* Accordion Cards */}
        <div className="mt-6 space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-black dark:border-white/15 ring-1 ring-black/15 dark:ring-white/10 bg-surface p-4.5 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 text-left group"
                >
                  <span className="text-[15px] sm:text-[16.5px] font-semibold text-text transition-colors group-hover:text-black dark:group-hover:text-white">
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/10 dark:border-white/15 bg-zinc-800/5 dark:bg-white/5 text-text transition-all duration-200 group-hover:bg-zinc-800/10 dark:group-hover:bg-white/10 ${
                      isOpen ? "rotate-180 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : ""
                    }`}
                  >
                    <ChevronDown size={14} strokeWidth={2.2} />
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-3 text-[13.5px] sm:text-[14px] leading-relaxed text-text-secondary border-t border-zinc-200 dark:border-zinc-800 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
