import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Clock,
  Headphones,
  ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import LandingFooter from "@/components/LandingFooter";
import BrandLogo from "@/components/branding/BrandLogo";
import "./contact-us.css";

gsap.registerPlugin(ScrollTrigger);

const Contact = () => {
  const { pathname } = useLocation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/features", label: "Features" },
    { href: "/how-it-works", label: "Analysis" },
    { href: "/pricing", label: "Pricing" },
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "support@callflow.com",
      link: "mailto:support@callflow.com",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "+1 (555) 123-4567",
      link: "tel:+15551234567",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Available 24/7",
      link: "#",
    },
    {
      icon: MapPin,
      title: "Visit Us",
      description: "123 Tech Street, San Francisco, CA 94105",
      link: "#",
    },
  ];

  const faqs = [
    {
      question: "How quickly will I receive a response?",
      answer:
        "We aim to respond to all inquiries within 24 hours during business days.",
    },
    {
      question: "Do you offer phone support?",
      answer:
        "Yes. Our support team is available 24/7 via phone, email, and live chat.",
    },
    {
      question: "Can I schedule a demo?",
      answer:
        "Absolutely. Use the contact form and select Schedule Demo to book a personalized session.",
    },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Message Sent",
      description:
        "Thanks for contacting us. We will get back to you within 24 hours.",
    });
    setFormData({ name: "", email: "", company: "", subject: "", message: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (!titleRef.current) return;

    const lines = titleRef.current.querySelectorAll(".contact-title-line");
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
        duration: 0.88,
        stagger: 0.14,
        ease: "power3.out",
      },
    );

    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-contact-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { y: 40, opacity: 0, filter: "blur(8px)" },
          {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      gsap.utils
        .toArray<HTMLElement>("[data-contact-card]")
        .forEach((el, i) => {
          gsap.fromTo(
            el,
            { y: 46, opacity: 0, rotateX: -6 },
            {
              y: 0,
              opacity: 1,
              rotateX: 0,
              duration: 0.82,
              delay: i * 0.05,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
              },
            },
          );
        });
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="contact-page min-h-screen bg-dark text-on-dark"
    >
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
              Contact
            </p>
            <h1
              ref={titleRef}
              className="font-display text-[4.1rem] md:text-[8.6rem] lg:text-[9.3rem] leading-[0.86] text-on-dark uppercase tracking-[-0.02em]"
            >
              <span className="contact-title-line block">Get In</span>
              <span className="contact-title-line block">Touch</span>
            </h1>
            <p className="font-body text-[1.05rem] text-muted-dark mt-6 leading-relaxed max-w-3xl">
              Have questions about pricing, support, or enterprise rollout? Our
              team responds fast.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-20 bg-dark-lighter">
        <div className="grid grid-cols-2 md:grid-cols-4">
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10 first:border-l-0">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              24/7
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              Live Support
            </p>
          </div>
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              &lt;24h
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              Response Time
            </p>
          </div>
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              4
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              Contact Channels
            </p>
          </div>
          <div className="text-center px-6 py-10 md:px-8 md:py-12 border-l border-lime/10">
            <p className="font-display text-[2.4rem] md:text-[2.9rem] text-lime leading-none mb-2 tracking-[-0.015em]">
              100K+
            </p>
            <p className="font-display text-[0.7rem] tracking-[0.21em] uppercase text-muted-dark">
              Users Supported
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-5">
            {contactMethods.map((method) => (
              <a
                key={method.title}
                data-contact-card
                href={method.link}
                className="contact-panel rounded-2xl p-6 md:p-7 group"
              >
                <div className="w-12 h-12 rounded-xl bg-lime/15 border border-lime/30 flex items-center justify-center mb-5 transition-transform duration-500 group-hover:scale-110">
                  <method.icon className="w-6 h-6 text-lime" />
                </div>
                <h3 className="font-display text-2xl uppercase text-on-dark mb-2 leading-[1.05]">
                  {method.title}
                </h3>
                <p className="font-body text-sm text-muted-dark leading-relaxed mb-5 break-words">
                  {method.description}
                </p>
                <div className="flex items-center gap-2 text-lime/85 font-display text-xs tracking-[0.15em] uppercase">
                  Open
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-dark-lighter">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid lg:grid-cols-[1.35fr_1fr] gap-8 md:gap-10">
            <article
              data-contact-reveal
              className="contact-panel rounded-2xl p-7 md:p-10"
            >
              <h2 className="font-display text-4xl md:text-5xl leading-[0.9] uppercase text-on-dark mb-3">
                Send a Message
              </h2>
              <p className="font-body text-sm text-muted-dark mb-8">
                Fill out the form and our team will get back to you quickly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-display text-xs tracking-[0.16em] uppercase text-lime/80 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="contact-input"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block font-display text-xs tracking-[0.16em] uppercase text-lime/80 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="contact-input"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-display text-xs tracking-[0.16em] uppercase text-lime/80 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="contact-input"
                    placeholder="Your Company"
                  />
                </div>

                <div>
                  <label className="block font-display text-xs tracking-[0.16em] uppercase text-lime/80 mb-2">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="contact-input"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales Question</option>
                    <option value="support">Technical Support</option>
                    <option value="partnership">Partnership Opportunity</option>
                    <option value="demo">Schedule Demo</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-display text-xs tracking-[0.16em] uppercase text-lime/80 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="contact-input resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full font-display tracking-[0.18em] uppercase bg-lime text-on-lime hover:bg-lime/90"
                >
                  Send Message
                </Button>
              </form>
            </article>

            <div className="space-y-6">
              <article
                data-contact-reveal
                className="contact-panel rounded-2xl p-7 md:p-8"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-lime" />
                  <h3 className="font-display text-2xl uppercase text-on-dark">
                    Support Hours
                  </h3>
                </div>
                <p className="font-body text-sm text-muted-dark leading-relaxed mb-6">
                  Our dedicated support team is available around the clock for
                  urgent issues and account guidance.
                </p>
                <Button
                  size="lg"
                  className="w-full font-display tracking-[0.16em] uppercase bg-lime text-on-lime hover:bg-lime/90"
                >
                  <Headphones className="mr-2 w-5 h-5" />
                  Start Live Chat
                </Button>
              </article>

              <article
                data-contact-reveal
                className="contact-panel rounded-2xl p-7 md:p-8"
              >
                <h3 className="font-display text-2xl uppercase text-on-dark mb-5">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div
                      key={faq.question}
                      className="rounded-xl border border-lime/15 bg-dark/55 p-4"
                    >
                      <p className="font-display text-base uppercase text-on-dark mb-2 leading-[1.15]">
                        {faq.question}
                      </p>
                      <p className="font-body text-sm text-muted-dark leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Contact;
