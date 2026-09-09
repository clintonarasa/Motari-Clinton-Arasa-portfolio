import { useEffect, useState } from "react";
import { supabase } from "@/integrations/neon/client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export interface ResumeData {
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    dates: string;
    responsibilities: string[];
    achievements: string[];
  }>;
  education: Array<{ degree: string; institution: string; dates: string; details: string }>;
  skills: { technical: string[]; soft: string[] };
  certifications: Array<{ name: string }>;
  awards: string[];
  references: ResumeReference[];
}

export interface ResumeReference {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

const emptyResumeData: ResumeData = {
  summary: "",
  experience: [],
  education: [],
  skills: { technical: [], soft: [] },
  certifications: [],
  awards: [],
  references: [],
};

type ExperienceRow = {
  title?: string;
  position?: string;
  company?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
  responsibilities?: string[];
  achievements?: string[];
};

type EducationRow = {
  field_of_study?: string;
  degree?: string;
  institution?: string;
  start_date?: string;
  startDate?: string;
  end_date?: string;
  endDate?: string;
  description?: string;
  details?: string;
};

type SkillRow = { category?: string; skill_name?: string };
type CertificationRow = { name?: string };
type AwardRow = { title?: string; name?: string };
type ReferenceRow = { id?: string; name?: string; title?: string; company?: string; email?: string; phone?: string };

function formatDate(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function formatDateRange(start?: string | null, end?: string | null, current?: boolean) {
  const startDate = formatDate(start);
  const endDate = current || !end ? "Present" : formatDate(end);
  return startDate ? `${startDate} - ${endDate}` : endDate === "Present" ? endDate : "";
}

function normalizeBulletList(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return values
    .filter((value): value is string => typeof value === "string")
    .flatMap((value) => value.split(/\r?\n|\s*[•●▪]\s*/))
    .map((value) => value.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

export function useResumeData() {
  const { profile, settingsReady } = useSiteSettings();
  const [data, setData] = useState<ResumeData>(emptyResumeData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!settingsReady) return;

    const loadResumeData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: admin } = await supabase
          .from("users")
          .select("id")
          .eq("is_admin", true)
          .limit(1)
          .single();

        if (!admin?.id) {
          setData({ ...emptyResumeData, summary: profile.summary || profile.bio });
          return;
        }

        const [experienceResult, educationResult, skillsResult, certificationsResult, awardsResult, referencesResult] = await Promise.all([
          supabase.from("experience").select("*").eq("user_id", admin.id).order("start_date", { ascending: false }),
          supabase.from("education").select("*").eq("user_id", admin.id).order("start_date", { ascending: false }),
          supabase.from("skills").select("*").eq("user_id", admin.id).order("category", { ascending: true }),
          supabase.from("certifications").select("*").eq("user_id", admin.id).order("issued_date", { ascending: false }),
          supabase.from("awards").select("*").eq("user_id", admin.id).order("awarded_date", { ascending: false }),
          supabase.from("references").select("*").eq("user_id", admin.id).order("created_at", { ascending: true }),
        ]);

        const failedQuery = [experienceResult, educationResult, skillsResult, certificationsResult, awardsResult, referencesResult].find((result) => result.error);
        if (failedQuery?.error) throw failedQuery.error;

        setData({
          summary: profile.summary || profile.bio,
          experience: ((experienceResult.data || []) as ExperienceRow[]).map((job) => ({
            title: job.title || job.position || "",
            company: job.company || "",
            location: job.location || "",
            dates: formatDateRange(job.start_date, job.end_date, job.is_current),
            responsibilities: normalizeBulletList(Array.isArray(job.responsibilities) ? job.responsibilities : job.description ? [job.description] : []),
            achievements: normalizeBulletList(job.achievements),
          })),
          education: ((educationResult.data || []) as EducationRow[]).map((item) => ({
            degree: item.field_of_study || item.degree || "",
            institution: item.institution || "",
            dates: formatDateRange(item.start_date || item.startDate, item.end_date || item.endDate),
            details: item.description || item.details || "",
          })),
          skills: {
            technical: ((skillsResult.data || []) as SkillRow[]).filter((skill) => skill.category === "technical").map((skill) => skill.skill_name).filter(Boolean),
            soft: ((skillsResult.data || []) as SkillRow[]).filter((skill) => skill.category === "soft").map((skill) => skill.skill_name).filter(Boolean),
          },
          certifications: ((certificationsResult.data || []) as CertificationRow[]).map((cert) => ({ name: cert.name || "" })).filter((cert) => cert.name),
          awards: ((awardsResult.data || []) as AwardRow[]).map((award) => award.title || award.name || "").filter(Boolean),
          references: ((referencesResult.data || []) as ReferenceRow[]).map((reference) => ({
            id: reference.id || `${reference.name}-${reference.email}`,
            name: reference.name || "",
            title: reference.title || "",
            company: reference.company || "",
            email: reference.email || "",
            phone: reference.phone || "",
          })).filter((reference) => reference.name),
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError : new Error("Unable to load resume data"));
      } finally {
        setLoading(false);
      }
    };

    void loadResumeData();
  }, [profile.bio, profile.summary, settingsReady]);

  return { data, loading, error };
}