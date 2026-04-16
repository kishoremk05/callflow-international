import { useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { companyInfo } from "@/lib/data";
import { animConfig } from "@/lib/animations";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/features", label: "Features" },
  { path: "/platform", label: "Platform" },
  { path: "/pricing", label: "Pricing" },
];

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggle = useCallback(() => setIsOpen((p) => !p), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 mix-blend-difference">
        <Link
          to="/"
          className="text-on-dark font-display text-xl md:text-2xl tracking-widest"
          onClick={close}
        >
          CALL<span className="text-lime">FLOW</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`font-display text-sm tracking-[0.2em] uppercase transition-colors duration-300 ${
                location.pathname === link.path
                  ? "text-lime"
                  : "text-on-dark hover:text-lime"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/pricing"
            className="font-display text-sm tracking-[0.2em] uppercase bg-lime text-on-lime px-5 py-2 hover:bg-lime/90 transition-all duration-300 glow-lime-hover"
          >
            Get Started
          </Link>
        </nav>

        {/* Mobile burger */}
        <button
          onClick={toggle}
          className="md:hidden flex flex-col gap-[5px] z-50 relative"
          aria-label="Toggle menu"
        >
          <motion.span
            className="block w-6 h-[2px] bg-current text-on-dark"
            animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
            transition={{ duration: animConfig.duration.fast }}
          />
          <motion.span
            className="block w-6 h-[2px] bg-current text-on-dark"
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: animConfig.duration.fast }}
          />
          <motion.span
            className="block w-6 h-[2px] bg-current text-on-dark"
            animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
            transition={{ duration: animConfig.duration.fast }}
          />
        </button>
      </header>

      {/* Mobile fullscreen menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ clipPath: "circle(0% at calc(100% - 40px) 30px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 30px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 40px) 30px)" }}
            transition={{
              duration: animConfig.duration.slow,
              ease: animConfig.ease.smooth,
            }}
            className="fixed inset-0 z-40 bg-dark flex flex-col items-center justify-center gap-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--lime)_/_0.18),transparent_35%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,hsl(var(--dark-card))_0%,hsl(var(--dark))_100%)] opacity-95" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-lime/40 to-transparent" />
            {navLinks.map((link, i) => (
              <motion.div
                key={link.path}
                className="relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
              >
                <Link
                  to={link.path}
                  onClick={close}
                  className={`font-display text-4xl md:text-5xl tracking-widest uppercase transition-colors ${
                    location.pathname === link.path
                      ? "text-lime opacity-50"
                      : "text-on-dark hover:text-lime"
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="absolute bottom-8 text-lime/50 text-xs font-body tracking-widest uppercase"
            >
              {companyInfo.tagline}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;
