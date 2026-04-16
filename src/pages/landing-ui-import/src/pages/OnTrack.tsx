import { useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/SplitText";
import ScrollReveal from "@/components/ScrollReveal";
import { features, stats } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
  useEffect(() => {
    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <div className="bg-dark min-h-screen pt-24">
      {/* Hero */}
      <section className="relative overflow-hidden flex items-end min-h-[50vh] px-6 md:px-16 py-16">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--lime)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--lime)) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/70 to-dark/30" />
        <div className="relative z-10">
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
            FEATURES
          </SplitText>
          <ScrollReveal delay={0.6} y={20}>
            <p className="text-muted-dark font-body text-sm mt-4 max-w-md">
              Everything your team needs for international communication — calling, meetings, billing, and security.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-dark-lighter border-y border-lime/10 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.1}>
              <div className="text-center">
                <p className="font-display text-3xl md:text-4xl text-lime">
                  {stat.value}
                </p>
                <p className="font-body text-xs text-muted-dark tracking-widest uppercase mt-1">
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-4xl md:text-6xl text-on-dark mb-4">
              Deep <span className="text-lime">Dive</span>
            </h2>
            <p className="text-muted-dark font-body text-sm max-w-lg mb-12">
              Explore every capability that makes CallFlow the most complete browser-based communication platform.
            </p>
          </ScrollReveal>

          <div className="space-y-6">
            {features.map((feature, i) => (
              <ScrollReveal key={feature.id} delay={i * 0.05}>
                <div className="bg-dark-lighter border border-lime/10 p-8 md:p-12 hover:border-lime/30 transition-all duration-500 group grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 items-start">
                  <span className="text-5xl">{feature.icon}</span>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-body text-[10px] text-lime tracking-[0.3em] uppercase border border-lime/20 px-2 py-1">
                        {feature.category}
                      </span>
                      <span className="font-body text-[10px] text-muted-dark tracking-[0.3em] uppercase">
                        {feature.subtitle}
                      </span>
                    </div>
                    <h3 className="font-display text-2xl md:text-3xl text-on-dark tracking-wider mb-3 group-hover:text-lime transition-colors">
                      {feature.title}
                    </h3>
                    <p className="font-body text-sm text-muted-dark leading-relaxed max-w-2xl">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <SplitText
            as="h2"
            className="font-display text-4xl md:text-6xl text-on-dark mb-6"
            splitBy="words"
            stagger={0.04}
          >
            Ready to upgrade your communication?
          </SplitText>
          <ScrollReveal delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/pricing"
                className="inline-block font-display text-sm tracking-[0.2em] uppercase bg-lime text-on-lime px-8 py-4 hover:bg-lime/90 transition-all duration-300 glow-lime"
              >
                View Pricing
              </Link>
              <Link
                to="/platform"
                className="inline-block font-display text-sm tracking-[0.2em] uppercase text-on-dark border border-lime/30 px-8 py-4 hover:border-lime hover:text-lime transition-all duration-300"
              >
                Explore Platform
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Features;
