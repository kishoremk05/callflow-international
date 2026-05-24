import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import LandingFooter from "@/components/LandingFooter";
import BrandLogo from "@/components/branding/BrandLogo";
import "./privacy-policy.css";

const TermsOfService = () => {
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "Analysis" },
    { href: "/pricing", label: "Pricing" },
  ];

  const currentPath =
    pathname.length > 1 && pathname.endsWith("/")
      ? pathname.slice(0, -1)
      : pathname;

  const isNavItemActive = (href: string) => {
    const normalizedHref =
      href.length > 1 && href.endsWith("/") ? href.slice(0, -1) : href;
    return currentPath === normalizedHref;
  };

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    if (!titleRef.current) return;

    const lines = titleRef.current.querySelectorAll(".privacy-title-line");
    if (!lines.length) return;

    const tl = gsap.timeline();
    tl.fromTo(
      lines,
      {
        x: -110,
        opacity: 0,
        filter: "blur(12px)",
      },
      {
        x: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.9,
        stagger: 0.14,
        ease: "power3.out",
      },
    );

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="terms-page min-h-screen bg-dark text-on-dark">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 mix-blend-difference">
        <a
          href="/"
          className="text-on-dark font-display text-xl md:text-2xl tracking-widest"
          onClick={closeMenu}
        >
          <BrandLogo
            iconClassName="text-lime"
            textClassName="font-display text-xl md:text-2xl tracking-widest text-on-dark uppercase"
          />
        </a>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`font-display text-sm tracking-[0.2em] uppercase transition-colors duration-300 ${
                isNavItemActive(item.href)
                  ? "text-lime"
                  : "text-on-dark hover:text-lime"
              }`}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/signup"
            className="font-display text-sm tracking-[0.2em] uppercase bg-lime text-on-lime px-5 py-2 hover:bg-lime/90 transition-all duration-300 glow-lime-hover"
          >
            Get Started
          </a>
        </nav>

        <button
          onClick={() => setIsOpen((v) => !v)}
          className="md:hidden flex flex-col gap-[5px] z-50 relative"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "rotate-45 translate-y-[7px]" : ""}`}
          />
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "opacity-0" : "opacity-100"}`}
          />
          <span
            className={`block w-6 h-[2px] bg-current text-on-dark transition-all ${isOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}
          />
        </button>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-dark flex flex-col items-center justify-center gap-8 overflow-hidden md:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--lime)_/_0.18),transparent_35%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--dark-card))_0%,hsl(var(--dark))_100%)] opacity-95" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/40 to-transparent" />

          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
              className={`relative z-10 font-display text-4xl tracking-widest uppercase transition-colors ${
                isNavItemActive(item.href)
                  ? "text-lime"
                  : "text-on-dark hover:text-lime"
              }`}
            >
              {item.label}
            </a>
          ))}

          <p className="absolute bottom-8 text-lime/50 text-xs font-body tracking-widest uppercase">
            Global Communication, Zero Boundaries
          </p>
        </div>
      ) : null}

      <section
        className="features-hero-shell relative z-20 pt-[118px] md:pt-[132px] pb-16 md:pb-20 px-6 md:px-12"
        style={{
          background:
            "linear-gradient(180deg, hsl(220 8% 5%) 0%, hsl(220 8% 7%) 100%)",
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="max-w-5xl">
            <p className="font-body text-xs tracking-[0.28em] uppercase text-lime/70 mb-5">
              Legal
            </p>
            <h1
              ref={titleRef}
              className="font-display text-[4.2rem] md:text-[8.4rem] lg:text-[9rem] leading-[0.86] text-on-dark uppercase tracking-[-0.02em]"
            >
              <span className="privacy-title-line block">Terms of</span>
              <span className="privacy-title-line block">Service</span>
            </h1>
            <p className="font-body text-[1.05rem] text-muted-dark mt-6 leading-relaxed max-w-2xl">
              Last updated: February 12, 2024
            </p>
            <p className="font-body text-sm text-muted-dark mt-2 max-w-2xl">
              Please read these terms carefully before using our services.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-20 bg-dark-lighter">
        <div className="grid grid-cols-2 md:grid-cols-4">
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10 first:border-l-0">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              12
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              Sections
            </p>
          </div>
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              99.9
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              Uptime Target
            </p>
          </div>
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              30D
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              Pricing Notice
            </p>
          </div>
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              24/7
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              Support Channel
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="policy-card rounded-2xl p-8 md:p-12">
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  1. Agreement to Terms
                </h2>
                <p className="text-gray-600 mb-4">
                  By accessing or using Palodial&apos;s services, you agree to
                  be bound by these Terms of Service and all applicable laws and
                  regulations. If you do not agree with any of these terms, you
                  are prohibited from using or accessing this service.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  2. Use License
                </h2>
                <p className="text-gray-600 mb-4">
                  Permission is granted to temporarily use Palodial&apos;s
                  services for personal or commercial telecommunications
                  purposes only. This is the grant of a license, not a transfer
                  of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    Use the service for any illegal purpose or in violation of
                    any regulations
                  </li>
                  <li>
                    Attempt to reverse engineer or decompile any part of the
                    service
                  </li>
                  <li>
                    Use the service to transmit spam, harassment, or threatening
                    communications
                  </li>
                  <li>
                    Attempt to gain unauthorized access to our systems or
                    networks
                  </li>
                  <li>
                    Use automated systems to access the service without
                    permission
                  </li>
                  <li>
                    Resell or redistribute the service without authorization
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  3. Account Registration
                </h2>
                <p className="text-gray-600 mb-4">
                  To use certain features of our service, you must register for
                  an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    Provide accurate, current, and complete information during
                    registration
                  </li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>
                    Accept responsibility for all activities that occur under
                    your account
                  </li>
                  <li>
                    Notify us immediately of any unauthorized use of your
                    account
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  4. Payment and Billing
                </h2>
                <p className="text-gray-600 mb-4">
                  All charges are billed in advance on a per-minute or
                  subscription basis depending on your plan. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    Pay all fees and charges in accordance with the pricing in
                    effect at the time
                  </li>
                  <li>Provide valid payment information</li>
                  <li>
                    Authorize us to charge your payment method for all fees
                    incurred
                  </li>
                  <li>Pay any applicable taxes</li>
                </ul>
                <p className="text-gray-600 mt-4">
                  We reserve the right to modify our pricing at any time. All
                  prices are subject to change with 30 days notice.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  5. Acceptable Use Policy
                </h2>
                <p className="text-gray-600 mb-4">
                  You agree not to use the service to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Violate any laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit harmful or malicious content</li>
                  <li>Harass, abuse, or harm another person</li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the service or servers</li>
                  <li>Engage in any form of fraudulent activity</li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  6. Service Availability
                </h2>
                <p className="text-gray-600 mb-4">
                  While we strive to maintain 99.9% uptime, we do not guarantee
                  that the service will be available at all times. We may
                  experience:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Scheduled maintenance periods</li>
                  <li>Unscheduled service interruptions</li>
                  <li>
                    Performance degradation due to factors beyond our control
                  </li>
                </ul>
                <p className="text-gray-600 mt-4">
                  We will make reasonable efforts to notify you of any scheduled
                  maintenance in advance.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  7. Termination
                </h2>
                <p className="text-gray-600 mb-4">
                  We may terminate or suspend your account immediately, without
                  prior notice or liability, for any reason whatsoever,
                  including without limitation if you breach the Terms. Upon
                  termination:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Your right to use the service will immediately cease</li>
                  <li>Any unused credit balance may be forfeited</li>
                  <li>
                    You remain responsible for any charges incurred before
                    termination
                  </li>
                </ul>
                <p className="text-gray-600 mt-4">
                  You may terminate your account at any time by contacting
                  customer support.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  8. Limitation of Liability
                </h2>
                <p className="text-gray-600 mb-4">
                  In no event shall Palodial, its directors, employees, or
                  agents be liable for any indirect, incidental, special,
                  consequential, or punitive damages, including without
                  limitation loss of profits, data, use, goodwill, or other
                  intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    Your access to or use of or inability to access or use the
                    service
                  </li>
                  <li>
                    Any conduct or content of any third party on the service
                  </li>
                  <li>
                    Unauthorized access, use, or alteration of your
                    transmissions or content
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  9. Disclaimer
                </h2>
                <p className="text-gray-600 mb-4">
                  Your use of the service is at your sole risk. The service is
                  provided on an "AS IS" and "AS AVAILABLE" basis. Palodial
                  expressly disclaims all warranties of any kind, whether
                  express or implied.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  10. Governing Law
                </h2>
                <p className="text-gray-600 mb-4">
                  These Terms shall be governed and construed in accordance with
                  the laws of the State of California, United States, without
                  regard to its conflict of law provisions.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  11. Changes to Terms
                </h2>
                <p className="text-gray-600 mb-4">
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. We will provide notice of any
                  material changes by posting the new Terms on this page and
                  updating the "Last updated" date.
                </p>
              </section>

              <section className="mb-0">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  12. Contact Information
                </h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions about these Terms of Service, please
                  contact us:
                </p>
                <ul className="list-none text-gray-600 space-y-2">
                  <li>Email: legal@callflow.com</li>
                  <li>Phone: +1 (555) 123-4567</li>
                  <li>Address: 123 Tech Street, San Francisco, CA 94105</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default TermsOfService;
