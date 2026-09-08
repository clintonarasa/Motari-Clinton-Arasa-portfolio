import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuthUser } from "@/hooks/useDatabase";
import { awardsService } from "@/integrations/supabase/services";

const AdminAwards = () => {
  const { toast } = useToast();
  const { user } = useAuthUser();
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newAward, setNewAward] = useState("");
  const [newOrg, setNewOrg] = useState("");

  useEffect(() => {
    if (user) loadAwards();
  }, [user]);

  const loadAwards = async () => {
    setLoading(true);
    const data = await awardsService.getAll(user!.id);
    setAwards(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newAward.trim()) return;
    try {
      await awardsService.create(user!.id, {
        title: newAward.trim(),
        issuer: newOrg.trim() || "Independent",
        awarded_date: new Date().toISOString().split('T')[0],
        description: "",
        featured: true
      });
      setNewAward("");
      setNewOrg("");
      await loadAwards();
      toast({ title: "Award added!" });
    } catch (e) {
      toast({ title: "Error adding award", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await awardsService.delete(id);
      setAwards(awards.filter(a => a.id !== id));
      toast({ title: "Award deleted!" });
    } catch (e) {
      toast({ title: "Error deleting award", variant: "destructive" });
    }
  };

  if (!user) return <div className="p-6">Please log in to manage awards.</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">Awards & Recognitions (Database)</h1>
      <div className="card-surface space-y-3">
        {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div> : (
          awards.map((a: any) => (
            <div key={a.id} className="flex gap-3 items-center bg-muted/50 p-3 rounded-lg border border-border">
              <div className="flex-1">
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-muted-foreground">{a.issuer}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(a.id)}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            </div>
          ))
        )}
        
        <div className="border-t border-border pt-4 mt-4 space-y-3">
          <p className="text-sm font-medium">Add New Award</p>
          <Input placeholder="Award name..." value={newAward} onChange={(e) => setNewAward(e.target.value)} />
          <Input placeholder="Issuing organization..." value={newOrg} onChange={(e) => setNewOrg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <Button variant="outline" size="sm" onClick={handleAdd} className="gap-1">
            <Plus size={14} /> Add Award
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAwards;
