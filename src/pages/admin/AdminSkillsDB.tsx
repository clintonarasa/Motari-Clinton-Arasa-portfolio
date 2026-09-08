import { useState, useEffect } from "react";
import { Save, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { skillsService } from "@/integrations/supabase/services";
import { useAuthUser } from "@/hooks/useDatabase";

interface Skill {
  id: string;
  category: "technical" | "soft";
  skill_name: string;
  proficiency: number;
  is_featured: boolean;
}

const AdminSkillsDB = () => {
  const { toast } = useToast();
  const { user, loading: userLoading } = useAuthUser();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTech, setNewTech] = useState("");
  const [newTechProficiency, setNewTechProficiency] = useState(50);
  const [newSoft, setNewSoft] = useState("");
  const [newSoftProficiency, setNewSoftProficiency] = useState(50);

  // Fetch skills from database
  useEffect(() => {
    if (!user) return;
    loadSkills();
    
  }, [user]);

  async function loadSkills() {
    if (!user) return;
    try {
      setLoading(true);
      const data = await skillsService.getAll(user.id);
      setSkills(data || []);
    } catch (error) {
      toast({
        title: "Error loading skills",
        description: error instanceof Error ? error.message : "Failed to load skills",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }

  const addSkill = async (type: "technical" | "soft") => {
    if (!user) {
      toast({ title: "Please log in first", variant: "destructive" });
      return;
    }

    const skillName = type === "technical" ? newTech : newSoft;
    const proficiency = type === "technical" ? newTechProficiency : newSoftProficiency;

    if (!skillName.trim()) {
      toast({ title: "Skill name is required", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      await skillsService.create(user.id, {
        category: type,
        skill_name: skillName.trim(),
        proficiency,
        is_featured: false
      });

      if (type === "technical") {
        setNewTech("");
        setNewTechProficiency(50);
      } else {
        setNewSoft("");
        setNewSoftProficiency(50);
      }

      toast({ title: "Skill added successfully!" });
      await loadSkills();
    } catch (error) {
      toast({
        title: "Error adding skill",
        description: error instanceof Error ? error.message : "Failed to add skill",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSkillProficiency = async (skillId: string, newProficiency: number) => {
    try {
      setSaving(true);
      await skillsService.update(skillId, { proficiency: newProficiency });
      toast({ title: "Skill updated!" });
      await loadSkills();
    } catch (error) {
      toast({
        title: "Error updating skill",
        description: error instanceof Error ? error.message : "Failed to update skill",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = async (skillId: string, currentFeatured: boolean) => {
    try {
      setSaving(true);
      await skillsService.update(skillId, { is_featured: !currentFeatured });
      loadSkills();
    } catch (error) {
      toast({
        title: "Error updating skill",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteSkill = async (skillId: string) => {
    try {
      setSaving(true);
      await skillsService.delete(skillId);
      toast({ title: "Skill deleted!" });
      loadSkills();
    } catch (error) {
      toast({
        title: "Error deleting skill",
        description: error instanceof Error ? error.message : "Failed to delete skill",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (userLoading) return <div className="text-center py-8">Loading...</div>;
  if (!user) return <div className="text-center py-8 text-red-500">Please log in to manage skills</div>;
  if (loading) return <div className="text-center py-8">Loading skills...</div>;

  const technicalSkills = skills.filter(s => s.category === "technical");
  const softSkills = skills.filter(s => s.category === "soft");

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-3xl mb-6">Skills (Database)</h1>
      
      <div className="space-y-6">
        {/* Technical Skills */}
        <div className="card-surface space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Technical Skills ({technicalSkills.length})
          </h2>

          {technicalSkills.length > 0 && (
            <div className="space-y-3 border-b pb-4">
              {technicalSkills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{skill.skill_name}</span>
                      {skill.is_featured && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Featured</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skill.proficiency}
                        onChange={(e) => updateSkillProficiency(skill.id, parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-8">{skill.proficiency}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatured(skill.id, skill.is_featured)}
                      disabled={saving}
                    >
                      {skill.is_featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSkill(skill.id)}
                      disabled={saving}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Add New Technical Skill</label>
            <div className="flex gap-2">
              <Input
                placeholder="Skill name..."
                value={newTech}
                onChange={(e) => setNewTech(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill("technical")}
              />
              <select
                value={newTechProficiency}
                onChange={(e) => setNewTechProficiency(parseInt(e.target.value))}
                className="px-3 py-2 border rounded-md"
              >
                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(level => (
                  <option key={level} value={level}>{level}%</option>
                ))}
              </select>
              <Button onClick={() => addSkill("technical")} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Soft Skills */}
        <div className="card-surface space-y-4">
          <h2 className="text-lg font-semibold text-primary">
            Soft Skills ({softSkills.length})
          </h2>

          {softSkills.length > 0 && (
            <div className="space-y-3 border-b pb-4">
              {softSkills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{skill.skill_name}</span>
                      {skill.is_featured && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Featured</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skill.proficiency}
                        onChange={(e) => updateSkillProficiency(skill.id, parseInt(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground w-8">{skill.proficiency}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeatured(skill.id, skill.is_featured)}
                      disabled={saving}
                    >
                      {skill.is_featured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSkill(skill.id)}
                      disabled={saving}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Add New Soft Skill</label>
            <div className="flex gap-2">
              <Input
                placeholder="Skill name..."
                value={newSoft}
                onChange={(e) => setNewSoft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill("soft")}
              />
              <select
                value={newSoftProficiency}
                onChange={(e) => setNewSoftProficiency(parseInt(e.target.value))}
                className="px-3 py-2 border rounded-md"
              >
                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(level => (
                  <option key={level} value={level}>{level}%</option>
                ))}
              </select>
              <Button onClick={() => addSkill("soft")} disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💾 Database Connected</h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Skills are now stored in Supabase! Changes sync in real-time across devices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSkillsDB;
