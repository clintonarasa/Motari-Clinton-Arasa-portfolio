import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuthUser } from "@/hooks/useDatabase";
import { referencesService } from "@/integrations/supabase/services";

const AdminReferences = () => {
  const { toast } = useToast();
  const { user } = useAuthUser();
  const [references, setReferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("");

  useEffect(() => {
    if (user) loadReferences();
  }, [user]);

  const loadReferences = async () => {
    setLoading(true);
    const data = await referencesService.getAll(user!.id);
    setReferences(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await referencesService.create(user!.id, {
        name: newName.trim(),
        title: newTitle.trim() || "Professional Connection",
        company: newCompany.trim() || "Independent",
        email: newContact.trim() || "no-email@example.com",
        phone: newPhone.trim(),
        relationship: "Colleague",
      });
      setNewName("");
      setNewTitle("");
      setNewCompany("");
      setNewContact("");
      setNewPhone("");
      await loadReferences();
      toast({ title: "Reference added!" });
    } catch (e) {
      toast({ title: "Error adding reference", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await referencesService.delete(id);
      setReferences(references.filter(r => r.id !== id));
      toast({ title: "Reference deleted!" });
    } catch (e) {
      toast({ title: "Error deleting reference", variant: "destructive" });
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-lg mt-6">
        <p className="text-muted-foreground mb-4">Your session has expired. Please log in to manage references.</p>
        <Link to="/admin/login">
          <Button>Go to Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">References (Database)</h1>
      <div className="space-y-4">
        <div className="card-surface space-y-4">
          {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div> : (
            references.map((r: any) => (
              <div key={r.id} className="flex gap-3 items-start bg-muted/50 p-4 rounded-lg border border-border">
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-lg">{r.name}</p>
                  <p className="text-sm font-medium text-primary">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
                  <Trash2 size={16} className="text-destructive" />
                </Button>
              </div>
            ))
          )}
          
          <div className="border-t border-border pt-4 mt-4 space-y-3">
            <p className="text-sm font-medium">Add New Reference</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <Input placeholder="Position/Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            </div>
            <Input placeholder="Workplace / Institution" value={newCompany} onChange={(e) => setNewCompany(e.target.value)} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Input type="email" placeholder="Contact email" value={newContact} onChange={(e) => setNewContact(e.target.value)} />
              <Input type="tel" placeholder="Referee phone number" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
            </div>
            <Button variant="outline" size="sm" onClick={handleAdd} className="gap-1">
              <Plus size={14} /> Add Reference
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReferences;
