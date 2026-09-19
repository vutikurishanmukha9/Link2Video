import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { FAQS } from "@/lib/seo-schema";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((cur) => (cur === idx ? null : idx));
  };

  return (
    <section id="faq" aria-labelledby="faq-title" className="shell mt-16 sm:mt-24 scroll-mt-16">
      <div className="mx-auto max-w-[800px]">
        {/* Centered Section Header */}
        <div className="text-center pb-8 border-b-2 border-black mb-8">
          <div className="inline-flex items-center justify-center gap-2 rounded-xs border-2 border-black bg-primary px-3.5 py-1 font-head text-xs font-bold text-black shadow-xs">
            <HelpCircle size={15} strokeWidth={2.5} aria-hidden="true" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2
            id="faq-title"
            className="font-head mt-4 text-2xl sm:text-4xl font-bold uppercase tracking-tight text-foreground"
          >
            COMMON QUESTIONS
          </h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Everything you need to know about downloading videos and audio safely and freely.
          </p>
        </div>

        {/* Neobrutalist Accordion Cards */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className={`overflow-hidden rounded-xs border-2 border-black bg-card transition-all duration-150 ${
                  isOpen
                    ? "shadow-md bg-accent/20"
                    : "shadow-sm hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left group"
                >
                  <span className="font-head text-base sm:text-[17px] font-bold text-foreground">
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xs border-2 border-black bg-primary text-black shadow-2xs transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-black text-white border-black" : ""
                    }`}
                  >
                    <ChevronDown size={18} strokeWidth={2.5} />
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t-2 border-black/10 px-5 pb-5 pt-3">
                    <p className="text-sm font-medium leading-relaxed text-foreground/85">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
