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

        {/* Center-Contained Accordion */}
        <div className="divide-y divide-border border-b border-border">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={faq.q} className="py-4 sm:py-4.5">
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 text-left group"
                >
                  <span className="text-[15px] sm:text-[16px] font-medium text-text transition-colors group-hover:text-accent">
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-surface-sunken text-text-muted transition-all duration-200 group-hover:border-border-strong group-hover:text-text ${
                      isOpen ? "rotate-180 text-text bg-surface" : ""
                    }`}
                  >
                    <ChevronDown size={14} strokeWidth={2} />
                  </span>
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-[14px] leading-relaxed text-text-secondary">{faq.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
