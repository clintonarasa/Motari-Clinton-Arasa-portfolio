import { useState, useEffect } from "react";
import { ArrowRight, Mail, Phone, MessageSquare, Linkedin, Github, Twitter, Facebook, Youtube, Instagram } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { personalInfo } from "@/data/portfolio-data";
import { supabase } from "@/integrations/neon/client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import type { SectionKey } from "@/pages/Index";

const companyLinks: { label: string; key: SectionKey }[] = [
  { label: "Home", key: "home" },
  { label: "Skills", key: "skills" },
  { label: "Experience", key: "experience" },
  { label: "Projects", key: "projects" },
  { label: "Blog", key: "blog" },
  { label: "Education", key: "education" },
];

interface FooterSectionProps {
  onNavigate?: (section: SectionKey) => void;
}

const FooterSection = ({ onNavigate }: FooterSectionProps) => {
  const { ownerName, logoUrl, profile: sharedProfile } = useSiteSettings();
  const { toast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('users').select('*').eq('is_admin', true).limit(1).single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, []);

  const contactLinks = [
    { label: "Contact Form", key: "contact" as SectionKey, icon: MessageSquare },
    { label: "Email", href: `mailto:${profile?.email || sharedProfile.email || personalInfo.email}`, icon: Mail },
    { label: "Phone", href: `tel:${profile?.phone || sharedProfile.phone || personalInfo.phone}`, icon: Phone },
  ];

  const socialLinks = [
    { label: "LinkedIn", href: profile?.linkedin_url || sharedProfile.linkedin || personalInfo.linkedin, icon: Linkedin },
    { label: "GitHub", href: profile?.github_url || sharedProfile.github || personalInfo.github, icon: Github },
    { label: "Twitter", href: "#", icon: Twitter },
    { label: "Facebook", href: "#", icon: Facebook },
    { label: "YouTube", href: "#", icon: Youtube },
    { label: "Instagram", href: "#", icon: Instagram },
  ];

  const handleSubscribe = async () => {
    const email = newsletterEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setIsSubscribing(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email });

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Already subscribed", description: "This email is already on our list!" });
        } else {
          throw error;
        }
      } else {
        toast({ title: "Subscribed!", description: "Thank you for subscribing to the newsletter." });
      }
      setNewsletterEmail("");
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleNav = (key: SectionKey) => {
    onNavigate?.(key);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-24 py-14">
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 md:gap-8">
          {/* Brand + newsletter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={logoUrl} alt="Logo" className="w-8 h-8" loading="lazy" />
              <p className="font-display text-xl">{ownerName}</p>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              Stay in the know by subscribing to my newsletter below.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                className="flex-1 min-w-0 bg-background border border-border rounded-l-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="bg-primary text-primary-foreground px-4 rounded-r-lg hover:opacity-90 transition-opacity flex items-center disabled:opacity-50"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Pages</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((l) => (
                <li key={l.key}>
                  <button
                    onClick={() => handleNav(l.key)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Contact</h4>
            <ul className="space-y-2.5">
              {contactLinks.map((l) => {
                const Icon = l.icon;
                return "key" in l && l.key ? (
                  <li key={l.label}>
                    <button
                      onClick={() => handleNav(l.key as SectionKey)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <Icon size={14} /> {l.label}
                    </button>
                  </li>
                ) : (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <Icon size={14} /> {l.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-sm mb-4">Social</h4>
            <ul className="space-y-2.5">
              {socialLinks.map((l) => {
                const Icon = l.icon;
                return (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <Icon size={14} /> {l.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-muted-foreground text-xs">
            © {ownerName}. All Rights Reserved {new Date().getFullYear()}
          </p>
          <p className="text-muted-foreground text-xs">
            Terms & Conditions
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
