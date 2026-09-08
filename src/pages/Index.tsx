import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PageTransition from "@/components/portfolio/PageTransition";
import NavigationBar from "@/components/portfolio/NavigationBar";
import HeroSection from "@/components/portfolio/HeroSection";
import ServicesSection from "@/components/portfolio/ServicesSection";
import TechStackSection from "@/components/portfolio/TechStackSection";
import SkillsSection from "@/components/portfolio/SkillsSection";
import ExperienceSection from "@/components/portfolio/ExperienceSection";
import ProjectsSection from "@/components/portfolio/ProjectsSection";
import BlogSection from "@/components/portfolio/BlogSection";
import EducationSection from "@/components/portfolio/EducationSection";
import AwardsSection from "@/components/portfolio/AwardsSection";
import HobbiesSection from "@/components/portfolio/HobbiesSection";
import ReferencesSection from "@/components/portfolio/ReferencesSection";
import ContactSection from "@/components/portfolio/ContactSection";
import FooterSection from "@/components/portfolio/FooterSection";
import { AnimatePresence, motion } from "framer-motion";

export type SectionKey =
  | "home"
  | "skills"
  | "experience"
  | "projects"
  | "blog"
  | "education"
  | "awards"
  | "hobbies"
  | "references"
  | "contact"
  | "techstack";

const HomePage = () => (
  <>
    <HeroSection />
    <ServicesSection />
  </>
);

const sectionContent: Record<SectionKey, React.FC> = {
  home: HomePage,
  skills: SkillsSection,
  experience: ExperienceSection,
  projects: ProjectsSection,
  blog: BlogSection,
  education: EducationSection,
  awards: AwardsSection,
  hobbies: HobbiesSection,
  references: ReferencesSection,
  contact: ContactSection,
  techstack: TechStackSection,
};

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionKey>("home");
  const [dataVersion, setDataVersion] = useState(() => localStorage.getItem("portfolio-data-updated") || "initial");

  useEffect(() => {
    const refresh = () => setDataVersion(localStorage.getItem("portfolio-data-updated") || String(Date.now()));
    window.addEventListener("portfolio-data-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("portfolio-data-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // Sync active section with URL hash (e.g. /#contact)
  useEffect(() => {
    const hash = location.hash.replace("#", "") as SectionKey;
    if (hash && Object.keys(sectionContent).includes(hash)) {
      setActiveSection(hash);
    } else if (!location.hash) {
      setActiveSection("home");
    }
  }, [location.hash]);

  const handleNavigate = (section: SectionKey) => {
    setActiveSection(section);
    navigate(section === "home" ? "/" : `/#${section}`);
  };

  const ActiveComponent = sectionContent[activeSection];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <NavigationBar activeSection={activeSection} onNavigate={handleNavigate} />
        <main className="flex-1 pt-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeSection}-${dataVersion}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </main>
        <div key={dataVersion}>
          <FooterSection onNavigate={handleNavigate} />
        </div>
      </div>
    </PageTransition>
  );
};

export default Index;
