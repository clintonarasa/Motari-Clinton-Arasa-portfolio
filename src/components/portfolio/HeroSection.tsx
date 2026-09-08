import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Mail, Linkedin, Github, ArrowDown, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { personalInfo, professionalSummary } from "@/data/portfolio-data";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { supabase } from "@/integrations/neon/client";
import { Button } from "@/components/ui/button";

const floatAnimation = {
  y: [0, -10, 0],
  transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
};

const roles = [
  "Full-Stack Developer",
  "Cloud Architect",
  "Open Source Contributor",
  "Problem Solver",
  "Tech Enthusiast",
];

const useTypingAnimation = (words: string[], typingSpeed = 80, deletingSpeed = 40, pauseDuration = 1800) => {
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const currentWord = words[wordIndex];
    if (!isDeleting) {
      const next = currentWord.slice(0, displayText.length + 1);
      setDisplayText(next);
      if (next === currentWord) {
        setTimeout(() => setIsDeleting(true), pauseDuration);
        return;
      }
    } else {
      const next = currentWord.slice(0, displayText.length - 1);
      setDisplayText(next);
      if (next === "") {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
        return;
      }
    }
  }, [displayText, isDeleting, wordIndex, words, pauseDuration]);

  useEffect(() => {
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, deletingSpeed, typingSpeed]);

  return displayText;
};

const HeroSection = () => {
  const { profilePhoto, profile: sharedProfile } = useSiteSettings();
  const typedRole = useTypingAnimation(roles);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('users').select('*').eq('is_admin', true).limit(1).single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, []);

  return (
    <section className="min-h-screen flex flex-col justify-center relative overflow-hidden px-6 md:px-12 lg:px-24 py-28">
      {/* Subtle background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-60 -left-40 w-[600px] h-[600px] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <div className="grid md:grid-cols-[auto_1fr] gap-16 items-center">
          {/* Profile photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, type: "spring", bounce: 0.25 }}
            className="flex justify-center md:justify-start"
          >
            <motion.div animate={floatAnimation} className="relative group">
              {/* Glow ring */}
              <div className="absolute -inset-3 rounded-3xl bg-primary/10 blur-xl group-hover:bg-primary/15 transition-colors duration-700" />
              {profilePhoto && (
                <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-2xl">
                  <img src={profilePhoto} alt={personalInfo.name} className="w-full h-full object-cover" />
                </div>
              )}
              {profilePhoto && <div className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-green-500 border-4 border-background shadow-lg" />}
            </motion.div>
          </motion.div>

          {/* Content */}
          <div className="text-center md:text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-4"
            >
              Portfolio
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, type: "spring" }}
              className="text-5xl md:text-7xl tracking-tight mb-5 leading-[1.1]"
            >
              {profile?.full_name || sharedProfile.name || personalInfo.name}
            </motion.h1>

            {/* Terminal typing */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-7 flex justify-center md:justify-start"
            >
              <span className="text-xl md:text-2xl font-display text-primary">
                {profile?.title || sharedProfile.title || typedRole}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                  className="inline-block w-[2px] h-[1.1em] bg-primary ml-1 align-middle"
                />
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto md:mx-0 text-base"
            >
              {profile?.bio || sharedProfile.bio || personalInfo.bio}
            </motion.p>

            {/* Contact links */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mb-8 justify-center md:justify-start"
            >
              {[
                { href: profile?.email || sharedProfile.email || personalInfo.email ? `mailto:${profile?.email || sharedProfile.email || personalInfo.email}` : "", icon: <Mail size={15} />, label: profile?.email || sharedProfile.email || personalInfo.email },
                { href: profile?.linkedin_url || sharedProfile.linkedin || personalInfo.linkedin, icon: <Linkedin size={15} />, label: "LinkedIn" },
                { href: profile?.github_url || sharedProfile.github || personalInfo.github, icon: <Github size={15} />, label: "GitHub" },
              ].map((item, i) =>
                item.href ? (
                  <motion.a
                    key={i}
                    href={item.href}
                    whileHover={{ color: "hsl(var(--primary))" }}
                    className="flex items-center gap-1.5 hover:text-primary transition-colors"
                  >
                    {item.icon} {item.label}
                  </motion.a>
                ) : (
                  <span key={i} className="flex items-center gap-1.5">
                    {item.icon} {item.label}
                  </span>
                )
              )}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="flex gap-4 justify-center md:justify-start"
            >
            <Link to="/resume">
              <Button size="lg" variant="secondary" className="gap-2 group rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Download size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                View Resume
              </Button>
            </Link>
              <a href="#contact">
              <Button size="lg" variant="secondary" className="gap-2 group rounded-xl hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                <Mail size={18} className="group-hover:-translate-y-0.5 transition-transform" />
                  Get in Touch
                </Button>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Professional Summary - refined card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3 }}
          className="mt-16 max-w-4xl"
        >
          <div className="card-surface relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-full" />
            <div className="pl-6">
              <h2 className="text-2xl mb-3">Professional Summary</h2>
              <p className="text-muted-foreground leading-relaxed text-base">{profile?.summary || professionalSummary}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
