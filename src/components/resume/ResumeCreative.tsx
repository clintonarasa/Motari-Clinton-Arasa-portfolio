import { Mail, MapPin, Phone } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import type { ResumeData } from "@/components/resume/useResumeData";

interface Props {
  profilePhoto: string;
  accent: string;
  data: ResumeData;
}

const ResumeCreative = ({ profilePhoto, accent, data }: Props) => {
  const { profile } = useSiteSettings();
  const { summary: professionalSummary, skills, experience: workExperience, education, certifications, awards } = data;
  const display = profile;
  const accentLight = accent + "22";
  return (
    <div className="font-sans text-[#222] bg-white max-w-4xl mx-auto overflow-hidden">
      <div className="text-white p-8 flex items-center gap-6" style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
        {profilePhoto && <img src={profilePhoto} alt={display.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white/30 shadow-lg" />}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{display.name}</h1>
          <p className="text-sm font-medium opacity-90 mt-1">{display.title}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-[10px] opacity-80">
            <span className="flex items-center gap-1"><Phone size={10} /> {display.phone}</span>
            <span className="flex items-center gap-1"><Mail size={10} /> {display.email}</span>
            <span className="flex items-center gap-1"><MapPin size={10} /> {display.location}</span>
          </div>
        </div>
      </div>
      <div className="p-8 space-y-6">
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-[4px] mb-2" style={{ color: accent }}>About Me</h2>
          <p className="text-xs text-[#555] leading-relaxed">{professionalSummary}</p>
        </section>
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-[4px] mb-3" style={{ color: accent }}>Experience</h2>
          <div className="space-y-4">
            {workExperience.map((job, i) => (
              <div key={i} className="pl-4 border-l-2" style={{ borderColor: accentLight }}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-xs font-bold">{job.title}</h3>
                  <span className="text-[9px] text-[#999] bg-[#f5f5f5] px-2 py-0.5 rounded-full">{job.dates}</span>
                </div>
                <p className="text-[10px] font-medium" style={{ color: accent }}>{job.company}</p>
                <ul className="mt-1 space-y-0.5 text-[10px] text-[#555]">
                  {job.responsibilities.slice(0, 3).map((r, j) => <li key={j}>• {r}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-[4px] mb-3" style={{ color: accent }}>Education</h2>
          <div className="space-y-2">
            {education.map((e, i) => (
              <div key={i} className="pl-4 border-l-2" style={{ borderColor: accentLight }}>
                <h3 className="text-xs font-bold">{e.degree}</h3>
                <p className="text-[10px]" style={{ color: accent }}>{e.institution} · {e.dates}</p>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-xs font-extrabold uppercase tracking-[4px] mb-3" style={{ color: accent }}>Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {[...skills.technical, ...skills.soft].map((s, i) => (
              <span key={i} className="text-[9px] font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: accentLight, color: accent }}>{s}</span>
            ))}
          </div>
        </section>
        <div className="grid grid-cols-2 gap-6">
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[4px] mb-2" style={{ color: accent }}>Certifications</h2>
            <ul className="space-y-1">
              {certifications.map((c, i) => <li key={i} className="text-[10px] text-[#555]">✦ {c.name}</li>)}
            </ul>
          </section>
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-[4px] mb-2" style={{ color: accent }}>Awards</h2>
            <ul className="space-y-1">
              {awards.map((a, i) => <li key={i} className="text-[10px] text-[#555]">🏆 {a}</li>)}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ResumeCreative;
