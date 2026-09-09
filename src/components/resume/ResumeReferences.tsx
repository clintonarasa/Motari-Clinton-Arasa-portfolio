import type { ResumeReference } from "@/components/resume/useResumeData";

interface Props {
  references: ResumeReference[];
  accent: string;
  compact?: boolean;
}

const ResumeReferences = ({ references, accent, compact = false }: Props) => {
  if (!references.length) return null;

  return (
    <section className={compact ? "mt-5" : "mt-6"}>
      <h2
        className={compact ? "text-[10px] font-semibold uppercase tracking-[3px] mb-2 pb-2 border-b" : "text-sm font-bold uppercase tracking-[3px] border-b pb-1 mb-3"}
        style={{ borderColor: accent }}
      >
        References
      </h2>
      <div className={compact ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 gap-5"}>
        {references.map((reference) => (
          <div key={reference.id} className={compact ? "text-[10px]" : "text-xs"}>
            <p className="font-semibold">{reference.name}</p>
            <p className="text-muted-foreground">{reference.title}{reference.company ? ` | ${reference.company}` : ""}</p>
            <p>{reference.email}</p>
            {reference.phone && <p>{reference.phone}</p>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResumeReferences;
