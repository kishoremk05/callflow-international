import { useEffect } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/SplitText";
import ScrollReveal from "@/components/ScrollReveal";
import { platformCapabilities, integrations } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger);

const Platform = () => {
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
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 70% 50%, hsl(var(--lime) / 0.06) 0%, hsl(220 8% 6%) 70%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-dark/20" />
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
            PLATFORM
          </SplitText>
          <ScrollReveal delay={0.6} y={20}>
            <p className="text-muted-dark font-body text-sm mt-4 max-w-md">
              Built for scale. Browser-based architecture, enterprise security,
              and seamless integrations.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-4xl md:text-6xl text-on-dark mb-4">
              Platform <span className="text-lime">Capabilities</span>
            </h2>
            <p className="text-muted-dark font-body text-sm max-w-lg mb-12">
              Every tool your team needs, designed to work together seamlessly
              in a single browser-based platform.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformCapabilities.map((item, i) => (
              <ScrollReveal key={item.id} delay={i * 0.06}>
                <div className="bg-dark-lighter border border-lime/10 p-6 hover:border-lime/30 transition-all duration-500 group h-full">
                  <span className="font-body text-[10px] text-lime tracking-[0.3em] uppercase">
                    {item.category}
                  </span>
                  <h3 className="font-display text-xl text-on-dark tracking-wider mt-2 mb-3 group-hover:text-lime transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-body text-xs text-muted-dark leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Highlight */}
      <section className="py-16">
        <div
          className="relative min-h-[50vh] md:min-h-[60vh] overflow-hidden flex items-center"
          style={{
            background:
              "linear-gradient(135deg, hsl(220 8% 8%) 0%, hsl(220 8% 12%) 50%, hsl(220 8% 8%) 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, hsl(var(--lime)) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/40 to-transparent" />
          <div className="relative z-10 p-8 md:p-16 max-w-lg">
            <ScrollReveal>
              <span className="font-body text-[10px] text-lime tracking-[0.3em] uppercase">
                Architecture
              </span>
              <h2 className="font-display text-5xl md:text-7xl text-on-dark leading-none mt-2">
                Built for <span className="text-lime">Scale</span>
              </h2>
              <p className="text-muted-dark font-body text-sm mt-4 leading-relaxed">
                Auto-scaling cloud infrastructure with global edge deployment.
                99.9% uptime SLA, end-to-end encryption, and real-time failover.
                From 1 user to 10,000+ seats — CallFlow grows with your
                organization.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Security & Compliance */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-4xl md:text-6xl text-on-dark mb-8">
              Security & <span className="text-lime">Compliance</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: "End-to-End Encryption",
                desc: "All calls and meetings are encrypted in transit and at rest. Zero-knowledge architecture for maximum privacy.",
              },
              {
                title: "SOC 2 Type II",
                desc: "Independently audited security controls. Compliance reports available for enterprise customers on request.",
              },
              {
                title: "Data Residency",
                desc: "Choose where your data lives. Regional deployment options for GDPR, HIPAA, and other regulatory requirements.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 0.1}>
                <div className="bg-dark-lighter border border-lime/10 p-8 hover:border-lime/30 transition-all duration-300">
                  <h3 className="font-display text-xl text-on-dark tracking-wider mb-3">
                    {item.title}
                  </h3>
                  <p className="font-body text-sm text-muted-dark leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="font-display text-4xl md:text-6xl text-on-dark mb-8">
              Works With <span className="text-lime">Everything</span>
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {integrations.map((name, i) => (
              <ScrollReveal key={name} delay={i * 0.04}>
                <div className="border border-lime/20 py-6 px-4 flex items-center justify-center hover:border-lime hover:bg-lime/5 transition-all duration-300">
                  <span className="font-display text-sm text-muted-dark tracking-widest uppercase text-center">
                    {name}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.2} className="mt-8 text-center">
            <Link
              to="/features"
              className="inline-block font-display text-sm tracking-[0.2em] uppercase text-lime border border-lime px-8 py-3 hover:bg-lime hover:text-on-lime transition-all duration-300"
            >
              View All Features
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Platform;
