import { useState } from "react";
import { Save, Plus, Trash2, ChevronDown, ChevronUp, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { projects as initial } from "@/data/portfolio-data";

type Project = typeof initial[0];
const emptyProject: Project = { name: "", description: "", technologies: [], role: "", link: "", screenshot: "" };

const AdminProjects = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Project[]>(JSON.parse(JSON.stringify(initial)));
  const [expanded, setExpanded] = useState<number | null>(0);
  const [newTech, setNewTech] = useState<Record<number, string>>({});

  const update = (i: number, field: keyof Project, value: string) => {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handleScreenshot = (i: number, file: File) => {
    const url = URL.createObjectURL(file);
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, screenshot: url } : item));
    toast({ title: "Image added", description: "Enable Cloud for persistent storage." });
  };

  const addTech = (i: number) => {
    const val = (newTech[i] || "").trim();
    if (!val) return;
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, technologies: [...item.technologies, val] } : item));
    setNewTech((p) => ({ ...p, [i]: "" }));
  };

  const removeTech = (i: number, ti: number) => {
    setItems((p) => p.map((item, idx) => idx === i ? { ...item, technologies: item.technologies.filter((_, k) => k !== ti) } : item));
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Projects</h1>
        <Button variant="outline" onClick={() => { setItems((p) => [...p, { ...emptyProject }]); setExpanded(items.length); }} className="gap-2">
          <Plus size={16} /> Add Project
        </Button>
      </div>
      <div className="space-y-4">
        {items.map((p, i) => (
          <div key={i} className="card-surface">
            <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                {p.screenshot ? (
                  <img src={p.screenshot} alt="" className="w-10 h-10 rounded object-cover" loading="lazy" />
                ) : (
                  <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                    <ImageIcon size={16} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-semibold">{p.name || "New Project"}</p>
                  <p className="text-sm text-muted-foreground">{p.role}</p>
                </div>
              </div>
              {expanded === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {expanded === i && (
              <div className="mt-4 space-y-4 border-t border-border pt-4">
                {/* Screenshot upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Screenshot</label>
                  {p.screenshot ? (
                    <div className="relative group w-full">
                      <img src={p.screenshot} alt="" className="w-full h-40 object-cover rounded-lg border border-border" loading="lazy" />
                      <button
                        onClick={() => update(i, "screenshot", "")}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 transition-colors">
                      <ImageIcon size={24} className="text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleScreenshot(i, e.target.files[0])}
                      />
                    </label>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input value={p.name} onChange={(e) => update(i, "name", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Input value={p.role} onChange={(e) => update(i, "role", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={p.description} onChange={(e) => update(i, "description", e.target.value)} rows={3} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Link</label>
                  <Input value={p.link} onChange={(e) => update(i, "link", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Technologies</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {p.technologies.map((t, ti) => (
                      <span key={ti} className="tag-pill flex items-center gap-1.5 text-xs">
                        {t}
                        <button onClick={() => removeTech(i, ti)} className="text-muted-foreground hover:text-destructive"><XIcon size={12} /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Add tech..." value={newTech[i] || ""} onChange={(e) => setNewTech((p) => ({ ...p, [i]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech(i))} />
                    <Button variant="outline" size="sm" onClick={() => addTech(i)}><Plus size={16} /></Button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}>
                    <Trash2 size={14} className="mr-1" /> Remove
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Button onClick={() => toast({ title: "Saved" })} className="gap-2">
          <Save size={16} /> Save All Projects
        </Button>
      </div>
    </div>
  );
};

const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
  </svg>
);

export default AdminProjects;
