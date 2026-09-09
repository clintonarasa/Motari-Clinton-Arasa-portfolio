import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import defaultLogo from "@/assets/logo.png";
import { supabase } from "@/integrations/neon/client";

const DEFAULT_ACCENT = "16 80% 52%"; // terracotta

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return `0 0% ${Math.round(l * 100)}%`;
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function hslToHex(hsl: string): string {
  const [h, s, l] = hsl.split(/\s+/).map((v) => parseFloat(v));
  const sN = s / 100, lN = l / 100;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = lN - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

interface SiteSettings {
  siteTitle: string;
  setSiteTitle: (title: string) => void;
  ownerName: string;
  setOwnerName: (name: string) => void;
  resumeUrl: string | null;
  resumeName: string | null;
  setResume: (url: string | null, name: string | null) => void;
  profilePhoto: string;
  setProfilePhoto: (url: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  resetLogo: () => void;
  faviconUrl: string | null;
  setFaviconUrl: (url: string | null) => void;
  accentColor: string;
  accentHex: string;
  setAccentHex: (hex: string) => void;
  resetAccent: () => void;
  profile: {
    name: string;
    title: string;
    bio: string;
    summary: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github: string;
  };
  updateProfile: (updates: Partial<SiteSettings["profile"]>) => void;
  settingsReady: boolean;
}

const SiteSettingsContext = createContext<SiteSettings | null>(null);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [siteTitle, setSiteTitleState] = useState(() => localStorage.getItem("site-title") || "Portfolio");
  const [ownerName, setOwnerNameState] = useState("");
  const [profile, setProfile] = useState({ name: "", title: "", bio: "", summary: "", email: "", phone: "", location: "", linkedin: "", github: "" });
  const [resumeUrl, setResumeUrl] = useState<string | null>(() => localStorage.getItem("resume-url"));
  const [resumeName, setResumeName] = useState<string | null>(() => localStorage.getItem("resume-name"));
  const [profilePhoto, setProfilePhoto] = useState<string>(() => {
    const stored = localStorage.getItem("profile-photo");
    if (!stored || stored.startsWith("blob:")) {
      localStorage.removeItem("profile-photo");
      return "";
    }
    return stored;
  });
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem("accent-color") || DEFAULT_ACCENT);
  const [logoUrl, setLogoUrlState] = useState(() => {
    const stored = localStorage.getItem("logo-url");
    if (stored?.startsWith("blob:")) {
      localStorage.removeItem("logo-url");
      return defaultLogo;
    }
    return stored || defaultLogo;
  });
  const [faviconUrl, setFaviconUrlState] = useState<string | null>(() => localStorage.getItem("favicon-url"));
  const [settingsUserId, setSettingsUserId] = useState<string | null>(null);
  const [settingsReady, setSettingsReady] = useState(false);
  const pendingSettings = useRef<Record<string, string | null>>({});

  const persistSetting = (values: Record<string, string | null>) => {
    if (!settingsUserId) {
      pendingSettings.current = { ...pendingSettings.current, ...values };
      return;
    }
    void supabase.from("users").update(values).eq("id", settingsUserId);
  };

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await supabase.from("users").select("id, site_title, full_name, title, bio, summary, email, phone, location, linkedin_url, github_url, accent_color, logo_url, resume_url, resume_name, favicon_url, avatar_url").eq("is_admin", true).limit(1).single();
      const settings = data as { id: string; site_title?: string; full_name?: string; title?: string; bio?: string; summary?: string; email?: string; phone?: string; location?: string; linkedin_url?: string; github_url?: string; accent_color?: string; logo_url?: string; resume_url?: string; resume_name?: string; favicon_url?: string; avatar_url?: string } | null;
      if (!settings) {
        setSettingsReady(true);
        return;
      }
      setSettingsUserId(settings.id);
      if (Object.keys(pendingSettings.current).length) {
        const pending = pendingSettings.current;
        pendingSettings.current = {};
        void supabase.from("users").update(pending).eq("id", settings.id);
      }
      if (settings.site_title) setSiteTitleState(settings.site_title);
      if (settings.full_name) {
        setOwnerNameState(settings.full_name);
      }
      setProfile((current) => ({
        ...current,
        name: settings.full_name || current.name,
        title: settings.title || current.title,
        bio: settings.bio || current.bio,
        summary: settings.summary || current.summary,
        email: settings.email || current.email,
        phone: settings.phone || current.phone,
        location: settings.location || current.location,
        linkedin: settings.linkedin_url || current.linkedin,
        github: settings.github_url || current.github,
      }));
      if (settings.accent_color) setAccentColor(settings.accent_color);
      if (settings.logo_url && !settings.logo_url.startsWith("blob:")) setLogoUrlState(settings.logo_url);
      if (settings.resume_url && !settings.resume_url.startsWith("blob:")) setResumeUrl(settings.resume_url);
      if (settings.resume_name) setResumeName(settings.resume_name);
      if (settings.favicon_url && !settings.favicon_url.startsWith("blob:")) setFaviconUrlState(settings.favicon_url);
      if (settings.avatar_url && !settings.avatar_url.startsWith("blob:")) setProfilePhoto(settings.avatar_url);
      setSettingsReady(true);
    };
    const refresh = () => void loadSettings();
    void loadSettings();
    window.addEventListener("portfolio-data-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("portfolio-data-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const setSiteTitle = (title: string) => {
    setSiteTitleState(title);
    persistSetting({ site_title: title });
  };

  const setOwnerName = (name: string) => {
    setOwnerNameState(name);
    setProfile((current) => ({ ...current, name }));
    persistSetting({ full_name: name });
  };

  const updateProfile = (updates: Partial<SiteSettings["profile"]>) => {
    setProfile((current) => ({ ...current, ...updates }));
  };

  const setLogoUrl = (url: string) => {
    setLogoUrlState(url);
    persistSetting({ logo_url: url === defaultLogo ? null : url });
    if (url === defaultLogo) localStorage.removeItem("logo-url");
    else localStorage.setItem("logo-url", url);
  };

  const resetLogo = () => {
    setLogoUrlState(defaultLogo);
    persistSetting({ logo_url: null });
    localStorage.removeItem("logo-url");
  };

  const setFaviconUrl = (url: string | null) => {
    setFaviconUrlState(url);
    persistSetting({ favicon_url: url });
    if (url) localStorage.setItem("favicon-url", url);
    else localStorage.removeItem("favicon-url");
  };

  const accentHex = hslToHex(accentColor);

  const setAccentHex = (hex: string) => {
    const hsl = hexToHsl(hex);
    setAccentColor(hsl);
    persistSetting({ accent_color: hsl });
    localStorage.setItem("accent-color", hsl);
  };

  const resetAccent = () => {
    setAccentColor(DEFAULT_ACCENT);
    persistSetting({ accent_color: DEFAULT_ACCENT });
    localStorage.removeItem("accent-color");
  };

  // Apply accent to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primary", accentColor);
    root.style.setProperty("--accent", accentColor);
    root.style.setProperty("--ring", accentColor);
  }, [accentColor]);

  const setResume = (url: string | null, name: string | null) => {
    setResumeUrl(url);
    setResumeName(name);
    persistSetting({ resume_url: url, resume_name: name });
    if (url) localStorage.setItem("resume-url", url);
    else localStorage.removeItem("resume-url");
    if (name) localStorage.setItem("resume-name", name);
    else localStorage.removeItem("resume-name");
  };

  const updateProfilePhoto = (url: string) => {
    setProfilePhoto(url);
    persistSetting({ avatar_url: url || null });
    if (!url) localStorage.removeItem("profile-photo");
    else localStorage.setItem("profile-photo", url);
  };

  useEffect(() => {
    document.title = siteTitle;
    localStorage.setItem("site-title", siteTitle);
  }, [siteTitle]);

  useEffect(() => {
    localStorage.setItem("owner-name", ownerName);
  }, [ownerName]);

  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (link && faviconUrl) link.href = faviconUrl;
  }, [faviconUrl]);

  return (
    <SiteSettingsContext.Provider value={{
      siteTitle, setSiteTitle,
      ownerName, setOwnerName,
      resumeUrl, resumeName, setResume,
      profilePhoto, setProfilePhoto: updateProfilePhoto,
      logoUrl, setLogoUrl, resetLogo, faviconUrl, setFaviconUrl,
      accentColor, accentHex, setAccentHex, resetAccent,
      profile, updateProfile, settingsReady,
    }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  return ctx;
};
