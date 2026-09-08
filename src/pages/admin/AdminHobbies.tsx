import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuthUser } from "@/hooks/useDatabase";
import { hobbiesService } from "@/integrations/supabase/services";

const AdminHobbies = () => {
  const { toast } = useToast();
  const { user } = useAuthUser();
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newHobby, setNewHobby] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    if (user) loadHobbies();
  }, [user]);

  const loadHobbies = async () => {
    setLoading(true);
    const data = await hobbiesService.getAll(user!.id);
    setHobbies(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newHobby.trim()) return;
    try {
      await hobbiesService.create(user!.id, {
        name: newHobby.trim(),
        description: newDesc.trim(),
      });
      setNewHobby("");
      setNewDesc("");
      await loadHobbies();
      toast({ title: "Hobby added!" });
    } catch (e) {
      toast({ title: "Error adding hobby", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await hobbiesService.delete(id);
      setHobbies(hobbies.filter((h) => h.id !== id));
      toast({ title: "Hobby deleted!" });
    } catch (e) {
      toast({ title: "Error deleting hobby", variant: "destructive" });
    }
  };

  if (!user) return <div className="p-6">Please log in to manage hobbies.</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">Hobbies & Interests (Database)</h1>
      <div className="card-surface space-y-4">
        {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div> : (
          hobbies.map((h: any) => (
            <div key={h.id} className="flex gap-3 items-center bg-muted/50 p-3 rounded-lg border border-border">
              <div className="flex-1">
                <p className="font-medium">{h.name}</p>
                <p className="text-xs text-muted-foreground">{h.description || "No description provided"}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(h.id)}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            </div>
          ))
        )}
        
        <div className="border-t border-border pt-4 mt-4 space-y-3">
          <p className="text-sm font-medium">Add New Hobby</p>
          <Input placeholder="Hobby name (e.g. Photography)" value={newHobby} onChange={(e) => setNewHobby(e.target.value)} />
          <Input placeholder="Short description" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <Button variant="outline" size="sm" onClick={handleAdd} className="gap-1">
            <Plus size={14} /> Add Hobby
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminHobbies;
