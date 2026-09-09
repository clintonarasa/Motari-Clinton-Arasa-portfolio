import { Mail, MapPin, Phone } from "lucide-react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import type { ResumeData } from "@/components/resume/useResumeData";
import ResumeReferences from "@/components/resume/ResumeReferences";

interface Props {
  profilePhoto: string;
  accent: string;
  data: ResumeData;
  showReferences: boolean;
}

const ResumeModern = ({ profilePhoto, accent, data, showReferences }: Props) => {
  const { profile } = useSiteSettings();
  const { summary: professionalSummary, skills, experience: workExperience, education, certifications, awards } = data;
  const display = profile;
  return (
  <div className="font-sans text-[#222] bg-white p-10 print:p-8 max-w-4xl mx-auto">
    <header className="flex items-center gap-6 mb-6">
      {profilePhoto && <img src={profilePhoto} alt={display.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#e5e5e5]" />}
      <div>
        <h1 className="text-3xl font-light tracking-tight">{display.name}</h1>
        <p className="text-sm text-[#888] font-medium mt-0.5">{display.title}</p>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-[10px] text-[#999]">
          <span className="flex items-center gap-1"><Phone size={10} /> {display.phone}</span>
          <span className="flex items-center gap-1"><Mail size={10} /> {display.email}</span>
          <span className="flex items-center gap-1"><MapPin size={10} /> {display.location}</span>
        </div>
      </div>
    </header>
    <hr className="mb-6" style={{ borderColor: accent }} />
    <section className="mb-7">
      <h2 className="text-[10px] font-semibold uppercase tracking-[3px] text-center mb-3 pb-2 border-b" style={{ borderColor: accent }}>About Me</h2>
      <p className="text-xs text-[#555] leading-relaxed">{professionalSummary}</p>
    </section>
    <section className="mb-7">
      <h2 className="text-[10px] font-semibold uppercase tracking-[3px] text-center mb-3 pb-2 border-b" style={{ borderColor: accent }}>Education</h2>
      <div className="space-y-3">
        {education.map((e, i) => (
          <div key={i} className="flex gap-6">
            <span className="text-[10px] text-[#999] font-medium w-24 flex-shrink-0 pt-0.5">{e.dates}</span>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide">{e.institution} | {e.degree}</h3>
              <p className="text-[10px] text-[#777] mt-0.5">{e.details}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
    <section className="mb-7">
      <h2 className="text-[10px] font-semibold uppercase tracking-[3px] text-center mb-3 pb-2 border-b" style={{ borderColor: accent }}>Work Experience</h2>
      <div className="space-y-4">
        {workExperience.map((job, i) => (
          <div key={i} className="flex gap-6">
            <span className="text-[10px] text-[#999] font-medium w-24 flex-shrink-0 pt-0.5">{job.dates}</span>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide">{job.company} | {job.title}</h3>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-[10px] text-[#555]">
                {job.responsibilities.map((r, j) => <li key={j}>{r}</li>)}
              </ul>
              {job.achievements.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-[10px]" style={{ color: accent }}>
                  {job.achievements.map((a, j) => <li key={j} className="font-medium">★ {a}</li>)}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
    <section className="mb-7">
      <h2 className="text-[10px] font-semibold uppercase tracking-[3px] text-center mb-3 pb-2 border-b" style={{ borderColor: accent }}>Skills</h2>
      <div className="grid grid-cols-3 gap-x-6 gap-y-1">
        {[...skills.technical, ...skills.soft].map((s, i) => (
          <span key={i} className="text-[10px] text-[#555] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />{s}
          </span>
        ))}
      </div>
    </section>
    <div className="grid grid-cols-2 gap-8">
      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-[3px] text-center mb-2 pb-2 border-b" style={{ borderColor: accent }}>Certifications</h2>
        <ul className="space-y-1">
          {certifications.map((c, i) => (
            <li key={i} className="text-[10px] text-[#555] flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccc] mt-1 flex-shrink-0" />{c.name}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-[10px] font-semibold uppercase tracking-[3px] text-center mb-2 pb-2 border-b" style={{ borderColor: accent }}>Awards</h2>
        <ul className="space-y-1">
          {awards.map((a, i) => (
            <li key={i} className="text-[10px] text-[#555] flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ccc] mt-1 flex-shrink-0" />{a}
            </li>
          ))}
        </ul>
      </section>
    </div>
    {showReferences && <ResumeReferences references={data.references} accent={accent} compact />}
  </div>
  );
};

export default ResumeModern;
