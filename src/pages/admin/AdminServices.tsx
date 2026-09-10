import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthUser } from "@/hooks/useDatabase";
import { supabase } from "@/integrations/neon/client";

interface Service {
  id?: string;
  title: string;
  description: string;
  icon: string;
  display_order: number;
}

const emptyService: Service = { title: "", description: "", icon: "Code2", display_order: 0 };
const iconOptions = ["Code2", "Cloud", "Handshake", "GraduationCap"];

const AdminServices = () => {
  const { toast } = useToast();
  const { user } = useAuthUser();
  const [services, setServices] = useState<Service[]>([]);
  const [draft, setDraft] = useState<Service>(emptyService);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadServices = async () => {
    const { data, error } = await supabase.from<Service[]>("services").select("*").order("display_order", { ascending: true });
    if (error) toast({ title: "Unable to load services", description: error.message, variant: "destructive" });
    else setServices((data || []) as Service[]);
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data, error } = await supabase.from<Service[]>("services").select("*").order("display_order", { ascending: true });
      if (error) toast({ title: "Unable to load services", description: error.message, variant: "destructive" });
      else setServices((data || []) as Service[]);
    };
    void load();
  }, [user, toast]);

  const saveService = async () => {
    if (!user || !draft.title.trim() || !draft.description.trim()) {
      toast({ title: "Title and description are required", variant: "destructive" });
      return;
    }
    const payload = { ...draft, title: draft.title.trim(), description: draft.description.trim(), user_id: user.id };
    const result = editingId
      ? await supabase.from("services").update(payload).eq("id", editingId).select()
      : await supabase.from("services").insert([payload]).select();
    if (result.error) {
      toast({ title: "Service could not be saved", description: result.error.message, variant: "destructive" });
      return;
    }
    setDraft(emptyService);
    setEditingId(null);
    await loadServices();
    toast({ title: editingId ? "Service updated" : "Service added" });
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) toast({ title: "Service could not be deleted", description: error.message, variant: "destructive" });
    else {
      setServices((current) => current.filter((service) => service.id !== id));
      toast({ title: "Service removed" });
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl mb-2">Services</h1>
        <p className="text-muted-foreground">Manage the services shown in the portfolio. Changes are stored in Neon and apply to every visitor.</p>
      </div>
      <div className="card-surface space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input placeholder="Service title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={draft.icon} onChange={(event) => setDraft({ ...draft, icon: event.target.value })}>
            {iconOptions.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
          </select>
        </div>
        <Textarea placeholder="Describe this service" rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
        <div className="flex gap-2">
          <Button onClick={saveService} className="gap-2"><Save size={14} /> {editingId ? "Update Service" : "Add Service"}</Button>
          {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setDraft(emptyService); }}>Cancel</Button>}
        </div>
      </div>
      <div className="space-y-3">
        {services.map((service) => (
          <div key={service.id} className="card-surface flex items-start gap-4">
            <div className="flex-1">
              <h2 className="font-semibold">{service.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
              <p className="text-xs text-muted-foreground mt-2">Icon: {service.icon}</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => { setEditingId(service.id || null); setDraft(service); }}>Edit</Button>
              {service.id && <Button variant="ghost" size="icon" onClick={() => deleteService(service.id!)} aria-label={`Delete ${service.title}`}><Trash2 size={15} className="text-destructive" /></Button>}
            </div>
          </div>
        ))}
        {!services.length && <p className="text-sm text-muted-foreground">No database services yet. Add your first service above.</p>}
      </div>
    </div>
  );
};

export default AdminServices;
