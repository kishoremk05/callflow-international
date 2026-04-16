import { companyInfo, integrations } from "@/lib/data";
import { Link, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();
  const isPricingPage = location.pathname === "/pricing";

  const heading = isPricingPage ? (
    <>
      Start connecting <span className="text-lime">globally</span> today
    </>
  ) : (
    <>
      Ready to <span className="text-lime">Connect</span>?
    </>
  );

  const description = isPricingPage
    ? "No credit card required. 14-day free trial on all plans."
    : "Start your free trial today. No credit card required.";

  return (
    <footer className="bg-dark">
      <div className="bg-dark-lighter py-16 md:py-20 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[200px] bg-lime/5 rounded-full blur-[100px]" />
        </div>

        <h3 className="font-display text-3xl md:text-5xl text-on-dark mb-4 relative z-10">
          {heading}
        </h3>

        <p className="text-muted-dark font-body text-sm max-w-md mx-auto mb-8 relative z-10">
          {description}
        </p>

        <Link
          to="/pricing"
          className="relative z-10 inline-block font-display text-sm tracking-[0.2em] uppercase bg-lime text-on-lime px-8 py-3 hover:bg-lime/90 transition-all duration-300 glow-lime-hover"
        >
          Start Free Trial
        </Link>
      </div>

      <div className="overflow-hidden py-6 border-b border-lime/10">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...integrations, ...integrations].map((p, i) => (
            <span
              key={i}
              className="mx-8 text-muted-dark font-display text-sm tracking-widest uppercase"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          <div className="md:col-span-6">
            <h3 className="font-display text-4xl text-lime tracking-widest mb-3">
              CALL<span className="text-on-dark">FLOW</span>
            </h3>
            <p className="text-muted-dark text-sm font-body leading-relaxed max-w-sm">
              {companyInfo.tagline}
            </p>
          </div>

          <div className="md:col-span-3">
            <p className="text-on-dark text-xs uppercase tracking-[0.25em] mb-5 font-display font-semibold">
              Pages
            </p>
            <div className="flex flex-col gap-3">
              {[
                { to: "/", label: "Home" },
                { to: "/features", label: "Features" },
                { to: "/pricing", label: "Pricing" },
                { to: "/blog", label: "Blog" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-muted-dark text-sm font-body hover:text-lime transition-colors duration-200 w-fit"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <p className="text-on-dark text-xs uppercase tracking-[0.25em] mb-5 font-display font-semibold">
              Information
            </p>
            <div className="flex flex-col gap-3">
              {[
                { to: "/contact", label: "Contact" },
                { to: "/privacy", label: "Privacy" },
                { to: "/terms", label: "Terms of use" },
                { to: "/about", label: "About" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-muted-dark text-sm font-body hover:text-lime transition-colors duration-200 w-fit"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-lime/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-dark text-xs font-body">
            © {new Date().getFullYear()} {companyInfo.name}. All rights
            reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/privacy"
              className="text-muted-dark text-xs font-body hover:text-lime transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <span className="text-muted-dark/30 text-xs">|</span>
            <Link
              to="/terms"
              className="text-muted-dark text-xs font-body hover:text-lime transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
