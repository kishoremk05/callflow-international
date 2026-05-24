import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { Shield } from "lucide-react";
import LandingFooter from "@/components/LandingFooter";
import BrandLogo from "@/components/branding/BrandLogo";
import "./privacy-policy.css";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
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
    <div className="privacy-page min-h-screen bg-dark text-on-dark">
      {/* Navigation */}
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

      {/* Hero Section */}
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
              Privacy
            </p>
            <h1
              ref={titleRef}
              className="font-display text-[4.8rem] md:text-[9rem] lg:text-[10rem] leading-[0.86] text-on-dark uppercase tracking-[-0.02em]"
            >
              <span className="privacy-title-line block">Privacy</span>
              <span className="privacy-title-line block">Policy</span>
            </h1>
            <p className="font-body text-[1.05rem] text-muted-dark mt-6 leading-relaxed max-w-2xl">
              Last updated: March 3, 2026
            </p>
            <p className="font-body text-sm text-muted-dark mt-2 max-w-2xl">
              Compliant with GDPR (EU Regulation 2016/679)
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-20 bg-dark-lighter">
        <div className="grid grid-cols-2 md:grid-cols-4">
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10 first:border-l-0">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              GDPR
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              Regulation
            </p>
          </div>
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              14
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              Sections
            </p>
          </div>
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              1
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              DPO Contact
            </p>
          </div>
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              30D
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              Notice Window
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="policy-card rounded-2xl p-8 md:p-12">
              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  1. Introduction and Scope
                </h2>
                <p className="text-gray-600 mb-4">
                  Welcome to Palodial. We respect your privacy and are committed
                  to protecting your personal data in accordance with the
                  General Data Protection Regulation (GDPR) - Regulation (EU)
                  2016/679. This privacy policy will inform you about how we
                  process your personal data when you visit our website or use
                  our services, describe your privacy rights under GDPR, and
                  explain how the law protects you.
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Data Controller:</strong> Palodial is the data
                  controller responsible for your personal data. If you have any
                  questions about this privacy policy or our data processing
                  practices, please contact our Data Protection Officer (DPO) at
                  dpo@callflow.com.
                </p>
                <p className="text-gray-600 mb-4">
                  <strong>Legal Basis for Processing:</strong> We process your
                  personal data based on:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                  <li>
                    <strong>Consent (Art. 6(1)(a) GDPR):</strong> You have given
                    explicit consent for specific processing activities
                  </li>
                  <li>
                    <strong>Contract Performance (Art. 6(1)(b) GDPR):</strong>{" "}
                    Processing is necessary to fulfill our contract with you
                  </li>
                  <li>
                    <strong>Legal Obligation (Art. 6(1)(c) GDPR):</strong> We
                    must process data to comply with legal requirements
                  </li>
                  <li>
                    <strong>Legitimate Interests (Art. 6(1)(f) GDPR):</strong>{" "}
                    Processing is necessary for our legitimate business
                    interests
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  2. Personal Data We Collect (Art. 13-14 GDPR)
                </h2>
                <p className="text-gray-600 mb-4">
                  In accordance with GDPR Article 13 and 14, we inform you about
                  the categories of personal data we collect, process, and
                  store:
                </p>
                <div className="space-y-4">
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Identity Data (Art. 4(1) GDPR)
                    </h3>
                    <p className="text-gray-600">
                      First name, last name, username, date of birth,
                      government-issued ID (where required for verification)
                    </p>
                  </div>
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Contact Data
                    </h3>
                    <p className="text-gray-600">
                      Email address, telephone numbers, billing address,
                      delivery address
                    </p>
                  </div>
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Financial Data
                    </h3>
                    <p className="text-gray-600">
                      Payment card details (tokenized), bank account
                      information, billing records, transaction history, wallet
                      balance
                    </p>
                  </div>
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Transaction Data
                    </h3>
                    <p className="text-gray-600">
                      Call detail records (CDR), call duration, destination
                      numbers, timestamps, costs per call, payment transactions
                    </p>
                  </div>
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Technical Data (Art. 4(1) GDPR)
                    </h3>
                    <p className="text-gray-600">
                      IP address, browser type and version, device information,
                      operating system, time zone settings, browser plug-in
                      types, geolocation data
                    </p>
                  </div>
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <h3 className="font-bold text-gray-800 mb-2">Usage Data</h3>
                    <p className="text-gray-600">
                      How you use our website and services, pages visited,
                      features used, time spent, click patterns, search queries
                    </p>
                  </div>
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Communications Data
                    </h3>
                    <p className="text-gray-600">
                      Your communication preferences, marketing consent status,
                      email subscription preferences, support ticket history
                    </p>
                  </div>
                  <div className="border-l-4 border-cyan-500 pl-4">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Voice Data (Special Category - Art. 9 GDPR)
                    </h3>
                    <p className="text-gray-600">
                      Call recordings (only when explicitly consented), voice
                      quality metrics, audio transmission data (encrypted
                      end-to-end). Note: We do not record call content by
                      default.
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mt-4">
                  <strong>Data We Do NOT Collect:</strong> We do not collect
                  special categories of personal data such as race, ethnicity,
                  political opinions, religious beliefs, trade union membership,
                  genetic data, or health data, except where required by law and
                  with your explicit consent.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  3. How We Process Your Data (Art. 5-6 GDPR)
                </h2>
                <p className="text-gray-600 mb-4">
                  We process your personal data in accordance with GDPR
                  principles of lawfulness, fairness, transparency, purpose
                  limitation, data minimization, accuracy, storage limitation,
                  integrity, and confidentiality (Art. 5 GDPR). We will only
                  process your personal data when we have a legal basis under
                  Art. 6 GDPR:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                  <h3 className="font-bold text-gray-800 mb-4">
                    Processing Purposes and Legal Bases:
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        1. Service Delivery (Art. 6(1)(b) - Contract
                        Performance)
                      </p>
                      <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-1">
                        <li>Establishing and managing your account</li>
                        <li>Processing voice calls and communications</li>
                        <li>Providing HD voice quality and call routing</li>
                        <li>Managing virtual phone numbers</li>
                        <li>Ensuring service availability and performance</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        2. Payment Processing (Art. 6(1)(b) - Contract
                        Performance)
                      </p>
                      <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-1">
                        <li>Processing payments and transactions</li>
                        <li>Managing wallet balances and credits</li>
                        <li>Generating invoices and billing statements</li>
                        <li>Fraud prevention and detection</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        3. Legal Compliance (Art. 6(1)(c) - Legal Obligation)
                      </p>
                      <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-1">
                        <li>
                          Maintaining call detail records as required by
                          telecommunications law
                        </li>
                        <li>Responding to lawful requests from authorities</li>
                        <li>Compliance with tax and accounting requirements</li>
                        <li>
                          Anti-money laundering (AML) and counter-terrorism
                          financing checks
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        4. Legitimate Interests (Art. 6(1)(f) - Legitimate
                        Interests)
                      </p>
                      <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-1">
                        <li>Service improvement and optimization</li>
                        <li>Security monitoring and threat detection</li>
                        <li>Analytics and performance measurement</li>
                        <li>Customer support and issue resolution</li>
                        <li>Network and system administration</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        5. Consent-Based Processing (Art. 6(1)(a) - Consent)
                      </p>
                      <ul className="list-disc pl-6 text-gray-600 mt-2 space-y-1">
                        <li>
                          Marketing communications and newsletters (you can
                          withdraw consent at any time)
                        </li>
                        <li>
                          Non-essential cookies and tracking (managed via cookie
                          preferences)
                        </li>
                        <li>
                          Call recording for quality assurance (explicit opt-in
                          required)
                        </li>
                        <li>
                          Sharing data with third-party integrations you choose
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-2">
                  <strong>Right to Object (Art. 21 GDPR):</strong> You have the
                  right to object to processing based on legitimate interests.
                  Contact us at dpo@callflow.com to exercise this right.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  4. Data Security (Art. 32 GDPR)
                </h2>
                <p className="text-gray-600 mb-4">
                  We have implemented appropriate technical and organizational
                  measures to ensure a level of security appropriate to the
                  risk, as required by Article 32 GDPR. Our security measures
                  include:
                </p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-cyan-600" />
                      Encryption
                    </h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>
                        End-to-end encryption (E2EE) for all voice
                        communications using WebRTC with SRTP
                      </li>
                      <li>TLS 1.3 encryption for all data in transit</li>
                      <li>AES-256 encryption for data at rest</li>
                      <li>
                        Encrypted database backups with secure key management
                      </li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-cyan-600" />
                      Access Controls
                    </h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>
                        Multi-factor authentication (MFA) for account access
                      </li>
                      <li>
                        Role-based access control (RBAC) for internal systems
                      </li>
                      <li>Least privilege principle for all system access</li>
                      <li>Automated access revocation procedures</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-cyan-600" />
                      Security Monitoring
                    </h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>24/7 security monitoring and threat detection</li>
                      <li>Regular security audits and penetration testing</li>
                      <li>
                        Intrusion detection and prevention systems (IDS/IPS)
                      </li>
                      <li>Automated vulnerability scanning</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-cyan-600" />
                      Data Protection
                    </h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>
                        Pseudonymization and anonymization where appropriate
                      </li>
                      <li>
                        Regular encrypted backups with disaster recovery plans
                      </li>
                      <li>Secure data deletion procedures</li>
                      <li>
                        Data breach notification procedures (Art. 33-34 GDPR)
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-gray-800 font-semibold mb-2">
                    Data Breach Notification (Art. 33-34 GDPR):
                  </p>
                  <p className="text-gray-600">
                    In the event of a personal data breach that poses a risk to
                    your rights and freedoms, we will notify the relevant
                    supervisory authority within 72 hours and notify affected
                    individuals without undue delay, as required by GDPR.
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  5. Data Retention (Art. 5(1)(e) GDPR)
                </h2>
                <p className="text-gray-600 mb-4">
                  We will only retain your personal data for as long as
                  reasonably necessary to fulfill the purposes we collected it
                  for, including for legal, regulatory, accounting, or reporting
                  requirements (storage limitation principle - Art. 5(1)(e)
                  GDPR).
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b">
                          Data Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b">
                          Retention Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b">
                          Legal Basis
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Call Detail Records (CDR)
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          12 months
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Telecommunications regulations, billing disputes
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Account Information
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          7 years after account closure
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Tax and accounting legal obligations
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Financial/Transaction Data
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          7 years
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Tax law, anti-money laundering regulations
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Marketing Consent
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Until consent withdrawn or 2 years of inactivity
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          GDPR consent requirements
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Support Tickets
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          3 years
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Service quality, dispute resolution
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Technical/Usage Logs
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          90 days (anonymized after 30 days)
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Security monitoring, service optimization
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Call Recordings (if opted-in)
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          90 days or until deletion requested
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Quality assurance, training (consent-based)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-600 mt-4">
                  <strong>Automated Deletion:</strong> After the retention
                  period expires, personal data is automatically and securely
                  deleted from our active systems. Backup copies are purged
                  during the next backup cycle.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  6. Your Rights Under GDPR (Chapter III, Art. 12-22)
                </h2>
                <p className="text-gray-600 mb-6">
                  Under the General Data Protection Regulation, you have the
                  following rights regarding your personal data. You can
                  exercise these rights free of charge by contacting us at
                  dpo@callflow.com:
                </p>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-lg border border-cyan-200">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-cyan-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                      Right of Access (Art. 15 GDPR)
                    </h3>
                    <p className="text-gray-600 mb-2">
                      You have the right to request access to your personal
                      data. You can:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Confirm whether we process your personal data</li>
                      <li>Obtain a copy of your personal data</li>
                      <li>
                        Receive information about the processing purposes,
                        categories of data, recipients, retention periods
                      </li>
                      <li>
                        Request this information free of charge (first request),
                        subsequent requests may incur reasonable fees
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Right to Rectification (Art. 16 GDPR)
                    </h3>
                    <p className="text-gray-600">
                      You can request correction of inaccurate or incomplete
                      personal data. We will respond within one month and notify
                      third parties if applicable.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg border border-red-200">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Right to Erasure / "Right to be Forgotten" (Art. 17 GDPR)
                    </h3>
                    <p className="text-gray-600 mb-2">
                      You can request deletion of your personal data in the
                      following situations:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>
                        Data is no longer necessary for the original purpose
                      </li>
                      <li>
                        You withdraw consent and there's no other legal ground
                        for processing
                      </li>
                      <li>
                        You object to processing and there are no overriding
                        legitimate grounds
                      </li>
                      <li>Data has been unlawfully processed</li>
                      <li>Legal obligation requires erasure</li>
                    </ul>
                    <p className="text-gray-600 mt-2">
                      <strong>Note:</strong> This right may be limited if we
                      must retain data for legal compliance (e.g., tax records,
                      telecommunications regulations).
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border border-yellow-200">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-yellow-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                      Right to Restriction of Processing (Art. 18 GDPR)
                    </h3>
                    <p className="text-gray-600 mb-2">
                      You can request limitation of processing when:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>
                        You contest the accuracy of data (restriction during
                        verification)
                      </li>
                      <li>Processing is unlawful but you don't want erasure</li>
                      <li>
                        We no longer need the data but you need it for legal
                        claims
                      </li>
                      <li>
                        You've objected to processing (restriction pending
                        verification)
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      Right to Data Portability (Art. 20 GDPR)
                    </h3>
                    <p className="text-gray-600">
                      You can receive your personal data in a structured,
                      commonly used, machine-readable format (e.g., JSON, CSV)
                      and transmit it to another controller. This applies to
                      automated processing based on consent or contract.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-lg border border-orange-200">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      Right to Object (Art. 21 GDPR)
                    </h3>
                    <p className="text-gray-600 mb-2">
                      You have the right to object to processing based on:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>
                        <strong>Legitimate interests:</strong> You can object at
                        any time, unless we demonstrate compelling legitimate
                        grounds that override your interests
                      </li>
                      <li>
                        <strong>Direct marketing:</strong> You have an absolute
                        right to object to marketing at any time (including
                        profiling for marketing)
                      </li>
                      <li>
                        <strong>Scientific/historical research:</strong> You can
                        object unless processing is necessary for public
                        interest
                      </li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Right to Withdraw Consent (Art. 7(3) GDPR)
                    </h3>
                    <p className="text-gray-600">
                      Where processing is based on consent, you can withdraw it
                      at any time. Withdrawal doesn't affect the lawfulness of
                      processing before withdrawal. You can manage consent
                      preferences in your account settings or by contacting us.
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border border-gray-300">
                    <h3 className="font-bold text-gray-800 mb-3 text-lg flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                        />
                      </svg>
                      Right Not to be Subject to Automated Decision-Making (Art.
                      22 GDPR)
                    </h3>
                    <p className="text-gray-600">
                      You have the right not to be subject to decisions based
                      solely on automated processing (including profiling) that
                      produce legal or similarly significant effects. We
                      currently do not employ fully automated decision-making
                      for critical purposes.
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-cyan-50 border-l-4 border-cyan-500 p-6 rounded">
                  <h3 className="font-bold text-gray-800 mb-3">
                    How to Exercise Your Rights:
                  </h3>
                  <p className="text-gray-600 mb-4">
                    To exercise any of these rights, please contact us at:
                  </p>
                  <ul className="list-none text-gray-600 space-y-2">
                    <li>
                      <strong>Email:</strong> dpo@callflow.com
                    </li>
                    <li>
                      <strong>Subject Line:</strong> "GDPR Data Subject Request
                      - [Your Right]"
                    </li>
                    <li>
                      <strong>Response Time:</strong> We will respond within 1
                      month (Art. 12(3) GDPR). For complex requests, this may be
                      extended by 2 months with notification.
                    </li>
                    <li>
                      <strong>Verification:</strong> We may request proof of
                      identity to prevent unauthorized disclosure.
                    </li>
                    <li>
                      <strong>No Fee:</strong> Exercising GDPR rights is free
                      unless requests are manifestly unfounded or excessive.
                    </li>
                  </ul>
                </div>

                <div className="mt-6 bg-red-50 border-l-4 border-red-500 p-6 rounded">
                  <h3 className="font-bold text-gray-800 mb-3">
                    Right to Lodge a Complaint (Art. 77 GDPR):
                  </h3>
                  <p className="text-gray-600">
                    If you believe we have violated your data protection rights,
                    you have the right to lodge a complaint with a supervisory
                    authority, particularly in the EU member state of your
                    habitual residence, place of work, or place of the alleged
                    infringement. You can find your local supervisory authority
                    at:{" "}
                    <a
                      href="https://edpb.europa.eu/about-edpb/board/members_en"
                      className="text-cyan-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://edpb.europa.eu/about-edpb/board/members_en
                    </a>
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  7. Third-Party Data Processors (Art. 28 GDPR)
                </h2>
                <p className="text-gray-600 mb-4">
                  We engage third-party service providers to help us deliver our
                  services. All processors are bound by Data Processing
                  Agreements (DPAs) compliant with Article 28 GDPR. We ensure
                  they implement appropriate technical and organizational
                  measures:
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Service Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Purpose
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                          Safeguards
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Twilio Inc.
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Voice calling infrastructure, call routing
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">USA</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          EU-US Data Privacy Framework, SCCs
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Stripe, Inc.
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Payment processing
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          USA/Ireland
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          PCI-DSS Level 1, EU presence
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Razorpay
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Payment processing (India region)
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          India
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          PCI-DSS compliant, local data residency
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Supabase Inc.
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Database hosting, authentication
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          EU/USA regions available
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          ISO 27001, SOC 2 Type II, regional deployment
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Google LLC
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          OAuth authentication, analytics
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">USA</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          EU-US Data Privacy Framework, SCCs
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Vercel Inc.
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          Application hosting, CDN
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">USA</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          SOC 2, EU edge locations
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-gray-600 mt-4">
                  <strong>Processor Obligations:</strong> All processors commit
                  to process data only on our documented instructions, maintain
                  confidentiality, implement security measures, assist with data
                  subject requests, and notify us of data breaches.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  8. International Data Transfers (Chapter V, Art. 44-50 GDPR)
                </h2>
                <p className="text-gray-600 mb-4">
                  We operate globally and may transfer your personal data to
                  countries outside the European Economic Area (EEA). We ensure
                  appropriate safeguards are in place as required by GDPR
                  Chapter V:
                </p>
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Transfers to Adequate Countries (Art. 45 GDPR)
                    </h3>
                    <p className="text-gray-600">
                      Where possible, we transfer data to countries with
                      adequacy decisions from the European Commission, ensuring
                      an adequate level of protection.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Standard Contractual Clauses (Art. 46(2)(c) GDPR)
                    </h3>
                    <p className="text-gray-600">
                      For transfers to countries without adequacy decisions
                      (e.g., USA), we use European Commission-approved Standard
                      Contractual Clauses (SCCs) - Decision 2021/914 - which
                      legally bind recipients to protect your data to EU
                      standards.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="font-bold text-gray-800 mb-2">
                      EU-US Data Privacy Framework
                    </h3>
                    <p className="text-gray-600">
                      Some US-based processors participate in the EU-US Data
                      Privacy Framework, providing adequacy for transatlantic
                      data transfers where applicable.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="font-bold text-gray-800 mb-2">
                      Additional Technical Measures
                    </h3>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>
                        End-to-end encryption for voice data (encrypted before
                        leaving your device)
                      </li>
                      <li>
                        Encryption in transit (TLS 1.3) and at rest (AES-256)
                      </li>
                      <li>
                        Pseudonymization and anonymization where appropriate
                      </li>
                      <li>
                        Regional data residency options (EU region available)
                      </li>
                      <li>Regular Transfer Impact Assessments (TIAs)</li>
                    </ul>
                  </div>
                </div>
                <p className="text-gray-600">
                  <strong>Your Right to Information:</strong> You can request
                  details about specific transfers, the safeguards in place, and
                  copies of SCCs by contacting dpo@callflow.com.
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  9. Cookies and Tracking Technologies (ePrivacy Directive)
                </h2>
                <p className="text-gray-600 mb-4">
                  We use cookies and similar tracking technologies in compliance
                  with the ePrivacy Directive and GDPR. We obtain your consent
                  for non-essential cookies through our cookie banner.
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Strictly Necessary Cookies (No Consent Required)
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Essential for website functionality:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Session management and authentication</li>
                      <li>Security and fraud prevention</li>
                      <li>Load balancing</li>
                      <li>Cookie consent preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Functional Cookies (Consent Required)
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Enhance functionality and personalization:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Language preferences</li>
                      <li>User interface customizations</li>
                      <li>Recent call history (local storage)</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Analytics Cookies (Consent Required)
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Help us understand usage patterns:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Google Analytics (anonymized IP)</li>
                      <li>Page views and navigation paths</li>
                      <li>Feature usage statistics</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">
                      Marketing Cookies (Consent Required)
                    </h3>
                    <p className="text-gray-600 mb-2">
                      Deliver relevant advertisements:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-1">
                      <li>Advertising platform pixels</li>
                      <li>Conversion tracking</li>
                      <li>Retargeting (only opted-in users)</li>
                    </ul>
                  </div>
                </div>
                <p className="text-gray-600 mt-4">
                  <strong>Managing Cookies:</strong> You can manage cookie
                  preferences through our cookie banner (shown on first visit)
                  or in your account settings. You can also configure your
                  browser to reject all cookies, though this may limit
                  functionality. For detailed information, see our{" "}
                  <button
                    onClick={() => navigate("/cookies")}
                    className="text-cyan-600 hover:underline"
                  >
                    Cookie Policy
                  </button>
                  .
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  10. Children's Privacy (Art. 8 GDPR)
                </h2>
                <p className="text-gray-600 mb-4">
                  Our service is not intended for children under 16 years of age
                  (or the age of digital consent in your jurisdiction). We do
                  not knowingly collect personal data from children under 16
                  without parental consent as required by Article 8 GDPR.
                </p>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="text-gray-600">
                    <strong>Parental Notice:</strong> If you are a parent or
                    guardian and believe your child has provided us with
                    personal data without consent, please contact us at
                    dpo@callflow.com. We will take steps to delete such
                    information from our systems within 30 days.
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  11. Data Protection by Design and Default (Art. 25 GDPR)
                </h2>
                <p className="text-gray-600 mb-4">
                  We implement privacy by design and by default principles
                  throughout our service:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>
                    <strong>Data Minimization:</strong> We only collect data
                    necessary for our service
                  </li>
                  <li>
                    <strong>Pseudonymization:</strong> Internal user IDs instead
                    of personal identifiers where possible
                  </li>
                  <li>
                    <strong>Encryption by Default:</strong> All voice
                    communications are encrypted end-to-end
                  </li>
                  <li>
                    <strong>Privacy Settings:</strong> Default settings
                    prioritize privacy (e.g., call recording is opt-in)
                  </li>
                  <li>
                    <strong>Transparency:</strong> Clear information about data
                    processing at every touchpoint
                  </li>
                  <li>
                    <strong>Regular Reviews:</strong> Ongoing Data Protection
                    Impact Assessments (DPIAs) for high-risk processing
                  </li>
                </ul>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  12. Data Protection Officer (Art. 37-39 GDPR)
                </h2>
                <p className="text-gray-600 mb-4">
                  We have appointed a Data Protection Officer (DPO) to oversee
                  our data protection strategy and ensure GDPR compliance:
                </p>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-600 mb-2">
                    <strong>Data Protection Officer</strong>
                  </p>
                  <p className="text-gray-600">Email: dpo@callflow.com</p>
                  <p className="text-gray-600">
                    Role: Monitors compliance, advises on DPIAs, cooperates with
                    supervisory authorities, acts as contact point for data
                    subjects
                  </p>
                </div>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  13. Changes to This Privacy Policy
                </h2>
                <p className="text-gray-600 mb-4">
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices, legal requirements, or service
                  offerings. We will:
                </p>
                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                  <li>Post the updated Privacy Policy on this page</li>
                  <li>
                    Update the "Last updated" date at the top of this policy
                  </li>
                  <li>
                    For material changes, provide prominent notice via email or
                    in-app notification at least 30 days before changes take
                    effect
                  </li>
                  <li>
                    For significant changes requiring new consent, we will
                    obtain your explicit consent before continuing processing
                  </li>
                </ul>
                <p className="text-gray-600 mt-4">
                  You are advised to review this Privacy Policy periodically.
                  Continued use of our services after changes constitutes
                  acceptance of the updated policy, unless explicit consent is
                  required.
                </p>
              </section>

              <section className="mb-0">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  14. Contact Us & Data Protection Queries
                </h2>
                <p className="text-gray-600 mb-4">
                  If you have any questions, concerns, or requests regarding
                  this Privacy Policy, data protection, or wish to exercise your
                  GDPR rights, please contact us:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-lg border border-cyan-200">
                    <h3 className="font-bold text-gray-800 mb-4">
                      Data Protection Officer
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>
                        <strong>Email:</strong> dpo@callflow.com
                      </li>
                      <li>
                        <strong>Subject:</strong> Mark as "GDPR Inquiry" or
                        "Data Subject Request"
                      </li>
                      <li>
                        <strong>Response Time:</strong> Within 1 month (Art.
                        12(3) GDPR)
                      </li>
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-6 rounded-lg border border-cyan-200">
                    <h3 className="font-bold text-gray-800 mb-4">
                      General Contact
                    </h3>
                    <ul className="space-y-2 text-gray-600">
                      <li>
                        <strong>Email:</strong> privacy@callflow.com
                      </li>
                      <li>
                        <strong>Phone:</strong> +1 (555) 123-4567
                      </li>
                      <li>
                        <strong>Address:</strong> 123 Tech Street, San
                        Francisco, CA 94105, USA
                      </li>
                      <li>
                        <strong>EU Representative:</strong> [If applicable under
                        Art. 27 GDPR]
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 bg-cyan-50 border-l-4 border-cyan-500 p-6 rounded">
                  <p className="text-gray-600 mb-2">
                    <strong>Supervisory Authority:</strong>
                  </p>
                  <p className="text-gray-600">
                    If you are located in the EEA and have unresolved concerns,
                    you may lodge a complaint with your local data protection
                    authority. Find your authority at:{" "}
                    <a
                      href="https://edpb.europa.eu/about-edpb/board/members_en"
                      className="text-cyan-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://edpb.europa.eu/about-edpb/board/members_en
                    </a>
                  </p>
                </div>
                <div className="mt-6 text-center p-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 font-semibold mb-2">
                    Full GDPR Text Reference
                  </p>
                  <p className="text-gray-600 text-sm">
                    For the complete text of the General Data Protection
                    Regulation (EU) 2016/679, visit:{" "}
                    <a
                      href="https://gdpr-info.eu/"
                      className="text-cyan-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      https://gdpr-info.eu/
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-dark-lighter border-y border-lime/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Questions About Your Privacy?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Our team is here to help. Contact us anytime with privacy-related
            questions or concerns.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/contact")}
            className="bg-lime text-on-lime hover:bg-lime/90"
          >
            Contact Us
          </Button>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default PrivacyPolicy;
