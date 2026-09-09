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

const ResumeClassic = ({ profilePhoto, accent, data, showReferences }: Props) => {
  const { profile } = useSiteSettings();
  const { summary: professionalSummary, skills, experience: workExperience, education, certifications, awards } = data;
  const display = profile;
  return (
  <div className="font-serif text-[#1a1a1a] bg-white p-10 print:p-8 max-w-4xl mx-auto">
    <div className="text-center border-b-2 pb-5 mb-6" style={{ borderColor: accent }}>
      <h1 className="text-3xl font-bold tracking-wide uppercase">{display.name}</h1>
      <p className="text-base text-[#555] mt-1 italic">{display.title}</p>
      <div className="flex justify-center flex-wrap gap-x-5 gap-y-1 mt-3 text-xs text-[#666]">
        <span className="flex items-center gap-1"><Phone size={11} /> {display.phone}</span>
        <span className="flex items-center gap-1"><Mail size={11} /> {display.email}</span>
        <span className="flex items-center gap-1"><MapPin size={11} /> {display.location}</span>
      </div>
    </div>
    <section className="mb-6">
      <h2 className="text-sm font-bold uppercase tracking-[3px] border-b pb-1 mb-3" style={{ borderColor: accent }}>Professional Summary</h2>
      <p className="text-xs leading-relaxed text-[#444]">{professionalSummary}</p>
    </section>
    <section className="mb-6">
      <h2 className="text-sm font-bold uppercase tracking-[3px] border-b pb-1 mb-3" style={{ borderColor: accent }}>Experience</h2>
      <div className="space-y-4">
        {workExperience.map((job, i) => (
          <div key={i}>
            <div className="flex justify-between items-baseline">
              <h3 className="text-sm font-bold">{job.title}</h3>
              <span className="text-[10px] text-[#777]">{job.dates}</span>
            </div>
            <p className="text-xs italic" style={{ color: accent }}>{job.company} — {job.location}</p>
            <ul className="mt-1 list-disc list-inside text-xs text-[#444] space-y-0.5">
              {job.responsibilities.map((r, j) => <li key={j}>{r}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
    <section className="mb-6">
      <h2 className="text-sm font-bold uppercase tracking-[3px] border-b pb-1 mb-3" style={{ borderColor: accent }}>Education</h2>
      <div className="space-y-2">
        {education.map((e, i) => (
          <div key={i} className="flex justify-between items-baseline">
            <div>
              <h3 className="text-xs font-bold">{e.degree}</h3>
              <p className="text-[10px] italic" style={{ color: accent }}>{e.institution}</p>
            </div>
            <span className="text-[10px] text-[#777]">{e.dates}</span>
          </div>
        ))}
      </div>
    </section>
    <section className="mb-6">
      <h2 className="text-sm font-bold uppercase tracking-[3px] border-b pb-1 mb-3" style={{ borderColor: accent }}>Skills</h2>
      <p className="text-xs text-[#444]">{[...skills.technical, ...skills.soft].join(" · ")}</p>
    </section>
    <div className="grid grid-cols-2 gap-6">
      <section>
        <h2 className="text-sm font-bold uppercase tracking-[3px] border-b pb-1 mb-2" style={{ borderColor: accent }}>Certifications</h2>
        <ul className="text-xs text-[#444] space-y-0.5 list-disc list-inside">
          {certifications.map((c, i) => <li key={i}>{c.name}</li>)}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-bold uppercase tracking-[3px] border-b pb-1 mb-2" style={{ borderColor: accent }}>Awards</h2>
        <ul className="text-xs text-[#444] space-y-0.5 list-disc list-inside">
          {awards.map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </section>
    </div>
    {showReferences && <ResumeReferences references={data.references} accent={accent} />}
  </div>
  );
};

export default ResumeClassic;
