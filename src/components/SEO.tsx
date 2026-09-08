import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

function setMeta(attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

function setLink(rel: string, href: string) {
  let element = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!element) {
    element = document.createElement("link");
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

const SEO = () => {
  const { pathname } = useLocation();
  const { siteTitle, profile, profilePhoto } = useSiteSettings();

  useEffect(() => {
    const name = profile.name || "Clinton Arasa";
    const title = profile.title || "Software Engineer and Full-Stack Developer";
    const description = (profile.summary || profile.bio || `${name} - ${title}. Explore projects, experience, skills, and professional background.`).replace(/\s+/g, " ").trim();
    const isPrivateRoute = pathname.startsWith("/admin") || pathname === "/reset-password";
    const pageTitle = pathname === "/resume" ? `${name} | Resume` : pathname === "/" ? `${name} | ${title}` : `${siteTitle || name} | Portfolio`;
    const canonicalUrl = new URL(pathname || "/", window.location.origin).toString();

    document.title = pageTitle;
    setMeta("name", "description", description.slice(0, 160));
    setMeta("name", "author", name);
    setMeta("name", "robots", isPrivateRoute ? "noindex, nofollow" : "index, follow");
    setMeta("property", "og:type", "website");
    setMeta("property", "og:title", pageTitle);
    setMeta("property", "og:description", description.slice(0, 160));
    setMeta("property", "og:url", canonicalUrl);
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", pageTitle);
    setMeta("name", "twitter:description", description.slice(0, 160));
    if (profilePhoto) setMeta("property", "og:image", new URL(profilePhoto, window.location.origin).toString());
    setLink("canonical", canonicalUrl);

    const existingSchema = document.getElementById("portfolio-person-schema");
    existingSchema?.remove();
    if (!isPrivateRoute) {
      const schema = document.createElement("script");
      schema.id = "portfolio-person-schema";
      schema.type = "application/ld+json";
      schema.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Person",
        name,
        jobTitle: title,
        description,
        url: window.location.origin,
        image: profilePhoto ? new URL(profilePhoto, window.location.origin).toString() : undefined,
        email: profile.email || undefined,
        telephone: profile.phone || undefined,
        address: profile.location ? { "@type": "PostalAddress", addressLocality: profile.location } : undefined,
        sameAs: [profile.linkedin, profile.github].filter(Boolean),
      });
      document.head.appendChild(schema);
    }
  }, [pathname, profile, profilePhoto, siteTitle]);

  return null;
};

export default SEO;