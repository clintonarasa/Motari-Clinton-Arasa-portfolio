import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import type { ResumeData } from "@/components/resume/useResumeData";
import ResumeReferences from "@/components/resume/ResumeReferences";

interface Props {
  profilePhoto: string;
  accent: string;
  data: ResumeData;
  showReferences: boolean;
}

const ResumeProfessional = ({ data, accent, showReferences }: Props) => {
  const { profile } = useSiteSettings();
  const competencies = [...data.skills.technical, ...data.skills.soft];
  const technicalSkills = data.skills.technical.map((skill) => {
    const separatorIndex = skill.indexOf(":");
    return separatorIndex === -1
      ? { label: "Technical", value: skill }
      : { label: skill.slice(0, separatorIndex), value: skill.slice(separatorIndex + 1).trim() };
  });

  return (
    <div className="font-serif text-[#171717] bg-white px-10 py-8 max-w-4xl mx-auto">
      <header className="text-center border-b pb-3 mb-4" style={{ borderColor: accent }}>
        <h1 className="text-2xl font-bold uppercase tracking-wide">{profile.name}</h1>
        <p className="text-[10px] font-bold uppercase mt-1">
          {profile.title}
        </p>
        <p className="text-[9px] mt-2">
          {profile.location} | {profile.phone} | {profile.email}
          {profile.linkedin ? ` | ${profile.linkedin}` : ""}
        </p>
      </header>

      <section className="mb-4">
        <h2 className="text-xs font-bold uppercase border-b pb-1 mb-2" style={{ borderColor: accent }}>Professional Summary</h2>
        <p className="text-[10px] leading-relaxed">{data.summary}</p>
      </section>

      <section className="mb-4">
        <h2 className="text-xs font-bold uppercase border-b pb-1 mb-2" style={{ borderColor: accent }}>Core ICT Competencies</h2>
        <p className="text-[10px] leading-relaxed">{competencies.join(" | ")}</p>
      </section>

      <section className="mb-4">
        <h2 className="text-xs font-bold uppercase border-b pb-1 mb-2" style={{ borderColor: accent }}>Technical Skills</h2>
        <div className="space-y-1 text-[10px] leading-relaxed">
          {technicalSkills.map((skill) => (
            <p key={skill.label}><strong>{skill.label}:</strong> {skill.value}</p>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <h2 className="text-xs font-bold uppercase border-b pb-1 mb-2" style={{ borderColor: accent }}>Professional Experience</h2>
        <div className="space-y-3">
          {data.experience.map((job, index) => (
            <article key={`${job.company}-${index}`}>
              <div className="flex justify-between gap-4 items-baseline">
                <h3 className="text-[10px] font-bold">{job.title} - {job.company}</h3>
                <span className="text-[9px] whitespace-nowrap">{job.dates}</span>
              </div>
              {job.location && <p className="text-[9px] italic">{job.location}</p>}
              <ul className="list-disc ml-4 mt-1 space-y-0.5 text-[10px] leading-relaxed">
                {job.responsibilities.map((responsibility, responsibilityIndex) => (
                  <li key={responsibilityIndex}>{responsibility}</li>
                ))}
                {job.achievements.map((achievement, achievementIndex) => (
                  <li key={`achievement-${achievementIndex}`}>{achievement}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-4">
        <h2 className="text-xs font-bold uppercase border-b pb-1 mb-2" style={{ borderColor: accent }}>Education</h2>
        <div className="space-y-2 text-[10px]">
          {data.education.map((item, index) => (
            <div key={`${item.institution}-${index}`}>
              <strong>{item.institution}</strong> - {item.degree} {item.dates && `| ${item.dates}`}
              {item.details && <p className="text-[9px]">{item.details}</p>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xs font-bold uppercase border-b pb-1 mb-2" style={{ borderColor: accent }}>Professional Development</h2>
        <ul className="list-disc ml-4 space-y-0.5 text-[10px]">
          {data.certifications.map((certification, index) => (
            <li key={`${certification.name}-${index}`}>{certification.name}</li>
          ))}
        </ul>
      </section>
      {showReferences && <ResumeReferences references={data.references} accent={accent} />}
    </div>
  );
};

export default ResumeProfessional;