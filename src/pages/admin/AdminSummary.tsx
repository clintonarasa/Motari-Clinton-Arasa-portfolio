import { useState, useEffect } from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthUser } from "@/hooks/useDatabase";
import { supabase } from "@/integrations/neon/client";

const AdminSummary = () => {
  const { toast } = useToast();
  const { user } = useAuthUser();
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) loadSummary();
  }, [user]);

  const loadSummary = async () => {
    setLoading(true);
    const { data } = await supabase.from('users').select('summary, bio').eq('id', user!.id).single();
    const profile = data as { summary?: string; bio?: string } | null;
    if (profile) setSummary(profile.summary || profile.bio || "");
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('users').update({ summary }).eq('id', user.id);
      if (error) throw error;
      window.dispatchEvent(new Event('portfolio-data-updated'));
      await loadSummary();
      toast({ title: "Summary Saved!" });
    } catch (error: unknown) {
      toast({ title: "Error saving summary", description: error instanceof Error ? error.message : "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">Professional Summary (Database)</h1>
      <div className="card-surface space-y-4">
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Summary</label>
              <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={6} placeholder="A brief overview of your professional background..." />
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save Changes
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSummary;
