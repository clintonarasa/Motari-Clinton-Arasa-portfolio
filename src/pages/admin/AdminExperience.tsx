import { useState } from "react";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { workExperience as initial } from "@/data/portfolio-data";

type Job = typeof initial[0];

const emptyJob: Job = { title: "", company: "", location: "", dates: "", responsibilities: [], achievements: [] };

const AdminExperience = () => {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>(JSON.parse(JSON.stringify(initial)));
  const [expanded, setExpanded] = useState<number | null>(0);

  const updateJob = (i: number, field: keyof Job, value: string) => {
    setJobs((p) => p.map((j, idx) => (idx === i ? { ...j, [field]: value } : j)));
  };

  const updateList = (i: number, field: "responsibilities" | "achievements", li: number, value: string) => {
    setJobs((p) => p.map((j, idx) => idx === i ? { ...j, [field]: j[field].map((v, k) => (k === li ? value : v)) } : j));
  };

  const addListItem = (i: number, field: "responsibilities" | "achievements") => {
    setJobs((p) => p.map((j, idx) => idx === i ? { ...j, [field]: [...j[field], ""] } : j));
  };

  const removeListItem = (i: number, field: "responsibilities" | "achievements", li: number) => {
    setJobs((p) => p.map((j, idx) => idx === i ? { ...j, [field]: j[field].filter((_, k) => k !== li) } : j));
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Work Experience</h1>
        <Button variant="outline" onClick={() => { setJobs((p) => [...p, { ...emptyJob }]); setExpanded(jobs.length); }} className="gap-2">
          <Plus size={16} /> Add Position
        </Button>
      </div>
      <div className="space-y-4">
        {jobs.map((job, i) => (
          <div key={i} className="card-surface">
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between text-left"
            >
              <div>
                <p className="font-semibold">{job.title || "New Position"}</p>
                <p className="text-sm text-muted-foreground">{job.company || "Company"} · {job.dates}</p>
              </div>
              {expanded === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expanded === i && (
              <div className="mt-4 space-y-4 border-t border-border pt-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Title</label>
                    <Input value={job.title} onChange={(e) => updateJob(i, "title", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <Input value={job.company} onChange={(e) => updateJob(i, "company", e.target.value)} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input value={job.location} onChange={(e) => updateJob(i, "location", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Dates</label>
                    <Input value={job.dates} onChange={(e) => updateJob(i, "dates", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Responsibilities</label>
                  {job.responsibilities.map((r, j) => (
                    <div key={j} className="flex gap-2">
                      <Input value={r} onChange={(e) => updateList(i, "responsibilities", j, e.target.value)} />
                      <Button variant="ghost" size="icon" onClick={() => removeListItem(i, "responsibilities", j)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addListItem(i, "responsibilities")} className="gap-1">
                    <Plus size={14} /> Add
                  </Button>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Achievements</label>
                  {job.achievements.map((a, j) => (
                    <div key={j} className="flex gap-2">
                      <Input value={a} onChange={(e) => updateList(i, "achievements", j, e.target.value)} />
                      <Button variant="ghost" size="icon" onClick={() => removeListItem(i, "achievements", j)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addListItem(i, "achievements")} className="gap-1">
                    <Plus size={14} /> Add
                  </Button>
                </div>

                <div className="flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => setJobs((p) => p.filter((_, idx) => idx !== i))}>
                    <Trash2 size={14} className="mr-1" /> Remove Position
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button onClick={() => toast({ title: "Saved" })} className="gap-2">
          <Save size={16} /> Save All Experience
        </Button>
      </div>
    </div>
  );
};

export default AdminExperience;
