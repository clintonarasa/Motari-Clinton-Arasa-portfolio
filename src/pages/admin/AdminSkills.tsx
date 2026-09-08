import { useState } from "react";
import { Save, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { skills as initialSkills } from "@/data/portfolio-data";

const AdminSkills = () => {
  const { toast } = useToast();
  const [technical, setTechnical] = useState([...initialSkills.technical]);
  const [soft, setSoft] = useState([...initialSkills.soft]);
  const [newTech, setNewTech] = useState("");
  const [newSoft, setNewSoft] = useState("");

  const addSkill = (type: "technical" | "soft") => {
    if (type === "technical" && newTech.trim()) {
      setTechnical((p) => [...p, newTech.trim()]);
      setNewTech("");
    } else if (type === "soft" && newSoft.trim()) {
      setSoft((p) => [...p, newSoft.trim()]);
      setNewSoft("");
    }
  };

  const removeSkill = (type: "technical" | "soft", index: number) => {
    if (type === "technical") setTechnical((p) => p.filter((_, i) => i !== index));
    else setSoft((p) => p.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">Skills</h1>
      <div className="space-y-6">
        {/* Technical */}
        <div className="card-surface space-y-4">
          <h2 className="text-lg font-semibold text-primary">Technical Skills</h2>
          <div className="flex flex-wrap gap-2">
            {technical.map((s, i) => (
              <span key={i} className="tag-pill flex items-center gap-1.5 border border-primary/20 bg-primary/5">
                {s}
                <button onClick={() => removeSkill("technical", i)} className="text-muted-foreground hover:text-destructive">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="New skill..." value={newTech} onChange={(e) => setNewTech(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("technical"))} />
            <Button variant="outline" size="sm" onClick={() => addSkill("technical")}><Plus size={16} /></Button>
          </div>
        </div>

        {/* Soft */}
        <div className="card-surface space-y-4">
          <h2 className="text-lg font-semibold text-primary">Soft Skills</h2>
          <div className="flex flex-wrap gap-2">
            {soft.map((s, i) => (
              <span key={i} className="tag-pill flex items-center gap-1.5">
                {s}
                <button onClick={() => removeSkill("soft", i)} className="text-muted-foreground hover:text-destructive">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="New skill..." value={newSoft} onChange={(e) => setNewSoft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill("soft"))} />
            <Button variant="outline" size="sm" onClick={() => addSkill("soft")}><Plus size={16} /></Button>
          </div>
        </div>

        <Button onClick={() => toast({ title: "Saved" })} className="gap-2">
          <Save size={16} /> Save All Skills
        </Button>
      </div>
    </div>
  );
};

export default AdminSkills;
