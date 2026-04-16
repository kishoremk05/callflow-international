import BrandLogo from "@/components/branding/BrandLogo";

const footerPageLinks = [
  { href: "/", label: "Home" },
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

const footerInfoLinks = [
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy" },
  { href: "/terms", label: "Terms of use" },
  { href: "/about", label: "About" },
];

const LandingFooter = () => {
  return (
    <footer className="bg-dark relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--lime) / 0.35) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--lime) / 0.35) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-10 md:py-14">
        <div
          className="rounded-[30px] bg-dark-lighter/35 px-8 md:px-14 py-12 md:py-16"
          style={{
            boxShadow:
              "0 22px 60px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
            background:
              "linear-gradient(180deg, hsl(220 8% 8%) 0%, hsl(220 8% 6%) 100%)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-12 items-start">
            <div className="md:col-span-5">
              <BrandLogo
                className="mb-5"
                iconClassName="h-9 w-9 md:h-10 md:w-10 text-lime"
                textClassName="font-display text-4xl md:text-5xl text-on-dark tracking-widest uppercase"
              />
              <p className="text-muted-dark text-[1.05rem] md:text-[1.1rem] font-body leading-relaxed max-w-md">
                Global Communication, Zero Boundaries
              </p>
            </div>

            <div className="md:col-span-3">
              <p className="font-display text-xs tracking-[0.2em] uppercase text-on-dark mb-6">
                Pages
              </p>
              <div className="flex flex-col gap-2.5">
                {footerPageLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-muted-dark text-[2rem] md:text-[2.15rem] leading-[1.15] font-body hover:text-lime transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-4">
              <p className="font-display text-xs tracking-[0.2em] uppercase text-on-dark mb-6">
                Information
              </p>
              <div className="flex flex-col gap-2.5">
                {footerInfoLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-muted-dark text-[2rem] md:text-[2.15rem] leading-[1.15] font-body hover:text-lime transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-14 pt-8 border-t border-lime/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-dark text-xs md:text-sm font-body">
              © 2026 CallFlow International. All rights reserved.
            </p>
            <p className="text-muted-dark text-xs md:text-sm font-body">
              Built with React &amp; Vite
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
