import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Button } from "@/components/ui/button";
import type { SectionKey } from "@/pages/Index";

const links: { label: string; key: SectionKey }[] = [
  { label: "Home", key: "home" },
  { label: "Skills", key: "skills" },
  { label: "Experience", key: "experience" },
  { label: "Projects", key: "projects" },
  { label: "Blog", key: "blog" },
  { label: "Education", key: "education" },
  { label: "Awards", key: "awards" },
  { label: "Contact", key: "contact" },
  { label: "Tech Stack", key: "techstack" },
];

interface NavigationBarProps {
  activeSection: SectionKey;
  onNavigate: (section: SectionKey) => void;
}

const NavigationBar = ({ activeSection, onNavigate }: NavigationBarProps) => {
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { ownerName, logoUrl } = useSiteSettings();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (key: SectionKey) => {
    onNavigate(key);
    setOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
        scrolled ? "bg-background/95 border-border shadow-sm" : "bg-background/60 border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => handleNav("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src={logoUrl} alt="Logo" className="w-8 h-8" />
          <span className="font-display text-xl whitespace-nowrap">{ownerName}</span>
        </button>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          {links.map((l) => (
            <motion.button
              key={l.key}
              onClick={() => handleNav(l.key)}
              whileHover={{ y: -2 }}
              className={`text-sm transition-colors relative ${
                activeSection === l.key
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              {l.label}
              {activeSection === l.key && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
            </motion.button>
          ))}
          {mounted && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 hover:bg-muted rounded-md transition-colors"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="block"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden text-foreground">
          <AnimatePresence mode="wait">
            <motion.span
              key={open ? "close" : "menu"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="block"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-background border-b border-border px-6 overflow-hidden"
          >
            <div className="pb-4 space-y-3 pt-2">
              {links.map((l, i) => (
                <motion.button
                  key={l.key}
                  onClick={() => handleNav(l.key)}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`block text-sm transition-colors ${
                    activeSection === l.key
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {l.label}
                </motion.button>
              ))}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="block w-full text-left p-2 hover:bg-muted rounded-md transition-colors text-sm"
                >
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavigationBar;
