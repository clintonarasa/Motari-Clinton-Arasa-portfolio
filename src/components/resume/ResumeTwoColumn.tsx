import { Mail, MapPin, Phone } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import type { ResumeData } from "@/components/resume/useResumeData";

interface Props {
  profilePhoto: string;
  accent: string;
  data: ResumeData;
}

const ResumeTwoColumn = ({ profilePhoto, accent, data }: Props) => {
  const { profile } = useSiteSettings();
  const { summary: professionalSummary, skills, experience: workExperience, education, certifications, awards } = data;
  const display = profile;
  return (
  <div className="font-sans text-[#222] bg-white max-w-4xl mx-auto flex min-h-[800px]">
    {/* Sidebar */}
    <div className="w-[240px] bg-[#1e293b] text-white p-6 flex-shrink-0 space-y-6">
      <div className="text-center">
        {profilePhoto && <img src={profilePhoto} alt={display.name} className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-white/20" />}
        <h1 className="text-lg font-bold mt-3 leading-tight">{display.name}</h1>
        <p className="text-[10px] text-white/70 mt-0.5">{display.title}</p>
      </div>
      <div>
        <h2 className="text-[9px] font-bold uppercase tracking-[3px] text-white/50 mb-2">Contact</h2>
        <div className="space-y-1.5 text-[10px] text-white/80">
          <p className="flex items-center gap-1.5"><Phone size={9} /> {display.phone}</p>
          <p className="flex items-center gap-1.5"><Mail size={9} /> {display.email}</p>
          <p className="flex items-center gap-1.5"><MapPin size={9} /> {display.location}</p>
        </div>
      </div>
      <div>
        <h2 className="text-[9px] font-bold uppercase tracking-[3px] text-white/50 mb-2">Skills</h2>
        <div className="space-y-1.5">
          {skills.technical.map((s, i) => (
            <div key={i}>
              <p className="text-[10px] text-white/80 mb-0.5">{s}</p>
              <div className="w-full h-1 rounded-full bg-white/10">
                <div className="h-full rounded-full" style={{ backgroundColor: accent, width: `${85 - i * 4}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-[9px] font-bold uppercase tracking-[3px] text-white/50 mb-2">Soft Skills</h2>
        <div className="flex flex-wrap gap-1">
          {skills.soft.map((s, i) => (
            <span key={i} className="text-[8px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full">{s}</span>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-[9px] font-bold uppercase tracking-[3px] text-white/50 mb-2">Certifications</h2>
        <ul className="space-y-1">
          {certifications.map((c, i) => (
            <li key={i} className="text-[9px] text-white/70">• {c.name}</li>
          ))}
        </ul>
      </div>
    </div>

    {/* Main */}
    <div className="flex-1 p-8 space-y-6">
      <section>
        <h2 className="text-xs font-bold uppercase tracking-[3px] text-[#1e293b] pb-1.5 border-b-2 mb-3" style={{ borderColor: accent }}>Profile</h2>
        <p className="text-xs text-[#555] leading-relaxed">{professionalSummary}</p>
      </section>
      <section>
        <h2 className="text-xs font-bold uppercase tracking-[3px] text-[#1e293b] pb-1.5 border-b-2 mb-3" style={{ borderColor: accent }}>Experience</h2>
        <div className="space-y-4">
          {workExperience.map((job, i) => (
            <div key={i}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-xs font-bold">{job.title}</h3>
                <span className="text-[9px] text-[#999]">{job.dates}</span>
              </div>
              <p className="text-[10px] font-medium" style={{ color: accent }}>{job.company} — {job.location}</p>
              <ul className="mt-1 space-y-0.5 text-[10px] text-[#555]">
                {job.responsibilities.map((r, j) => (
                  <li key={j} className="flex items-start gap-1.5">
                    <span className="mt-0.5 text-[6px]" style={{ color: accent }}>●</span><span>{r}</span>
                  </li>
                ))}
              </ul>
              {job.achievements.length > 0 && (
                <div className="mt-1 text-[10px]" style={{ color: accent }}>
                  {job.achievements.map((a, j) => <p key={j} className="font-medium">◆ {a}</p>)}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xs font-bold uppercase tracking-[3px] text-[#1e293b] pb-1.5 border-b-2 mb-3" style={{ borderColor: accent }}>Education</h2>
        <div className="space-y-2">
          {education.map((e, i) => (
            <div key={i}>
              <div className="flex justify-between items-baseline">
                <h3 className="text-xs font-bold">{e.degree}</h3>
                <span className="text-[9px] text-[#999]">{e.dates}</span>
              </div>
              <p className="text-[10px]" style={{ color: accent }}>{e.institution}</p>
              <p className="text-[9px] text-[#777]">{e.details}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xs font-bold uppercase tracking-[3px] text-[#1e293b] pb-1.5 border-b-2 mb-3" style={{ borderColor: accent }}>Awards</h2>
        <ul className="space-y-0.5">
          {awards.map((a, i) => (
            <li key={i} className="text-[10px] text-[#555] flex items-start gap-1.5">
              <span className="mt-0.5 text-[6px]" style={{ color: accent }}>●</span>{a}
            </li>
          ))}
        </ul>
      </section>
    </div>
  </div>
  );
};

export default ResumeTwoColumn;
