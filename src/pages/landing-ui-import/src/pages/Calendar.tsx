import { useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/SplitText";
import ScrollReveal from "@/components/ScrollReveal";
import { pricingTiers, featureComparison, faqItems } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

const Pricing = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="bg-dark min-h-screen pt-24">
      {/* Hero */}
      <section className="px-6 md:px-16 py-16">
        <SplitText
          as="h1"
          className="font-display text-7xl md:text-[10rem] text-on-dark leading-none tracking-tighter"
          splitBy="chars"
          stagger={0.03}
          duration={0.8}
          y={80}
          onScroll={false}
          delay={0.2}
        >
          PRICING
        </SplitText>
        <ScrollReveal delay={0.6} y={20}>
          <p className="text-muted-dark font-body text-sm mt-4 max-w-md">
            Transparent pricing for teams of every size. Start free, scale as
            you grow.
          </p>
        </ScrollReveal>
      </section>

      {/* Pricing Cards */}
      <section
        id="pricing-details"
        className="px-6 md:px-16 pb-16 scroll-mt-28"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {pricingTiers.map((tier, i) => (
            <ScrollReveal key={tier.id} delay={i * 0.1}>
              <div
                className={`border p-8 transition-all duration-300 h-full flex flex-col ${
                  tier.highlighted
                    ? "border-lime bg-lime/5 hover:bg-lime/10"
                    : "border-lime/20 bg-dark-lighter hover:border-lime/40"
                }`}
              >
                <div>
                  <span className="font-display text-xs text-lime tracking-widest uppercase">
                    {tier.name}
                  </span>
                  <div className="flex items-baseline gap-1 mt-2 mb-2">
                    <span className="font-display text-5xl md:text-6xl text-on-dark">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="font-body text-sm text-muted-dark">
                        {tier.period}
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-muted-dark mb-6">
                    {tier.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 font-body text-sm text-on-dark"
                    >
                      <span className="text-lime text-xs mt-1">✦</span>
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full font-display text-sm tracking-[0.2em] uppercase py-3 transition-all duration-300 ${
                    tier.highlighted
                      ? "bg-lime text-on-lime hover:bg-lime/90 glow-lime"
                      : "border border-lime/30 text-on-dark hover:border-lime hover:text-lime"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 px-6 md:px-16">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-4xl md:text-6xl text-on-dark mb-8">
              Compare <span className="text-lime">Plans</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-lime/20">
                    <th className="text-left py-3 px-4 font-display text-xs text-muted-dark tracking-widest uppercase">
                      Feature
                    </th>
                    <th className="text-center py-3 px-4 font-display text-xs text-muted-dark tracking-widest uppercase">
                      Starter
                    </th>
                    <th className="text-center py-3 px-4 font-display text-xs text-lime tracking-widest uppercase">
                      Business
                    </th>
                    <th className="text-center py-3 px-4 font-display text-xs text-muted-dark tracking-widest uppercase">
                      Enterprise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureComparison.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-lime/5 hover:bg-lime/5 transition-colors"
                    >
                      <td className="py-4 px-4 font-body text-sm text-on-dark">
                        {row.feature}
                      </td>
                      <td className="py-4 px-4 font-body text-sm text-muted-dark text-center">
                        {row.starter}
                      </td>
                      <td className="py-4 px-4 font-body text-sm text-lime text-center">
                        {row.business}
                      </td>
                      <td className="py-4 px-4 font-body text-sm text-muted-dark text-center">
                        {row.enterprise}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 px-6 md:px-16">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-4xl md:text-6xl text-on-dark mb-12 text-center">
              Frequently <span className="text-lime">Asked</span>
            </h2>
          </ScrollReveal>

          <div className="space-y-2">
            {faqItems.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="border border-lime/10 hover:border-lime/20 transition-colors">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full text-left p-6 flex items-center justify-between"
                  >
                    <span className="font-display text-sm md:text-base text-on-dark tracking-wider pr-4">
                      {faq.question}
                    </span>
                    <span
                      className={`text-lime font-display text-xl transition-transform duration-300 flex-shrink-0 ${
                        openFaq === i ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-500 ease-out ${
                      openFaq === i
                        ? "max-h-96 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <p className="px-6 pb-6 font-body text-sm text-muted-dark leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
