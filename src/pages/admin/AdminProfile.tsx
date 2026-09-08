import { useState, useRef, useEffect } from "react";
import { Save, Camera, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { useAuthUser } from "@/hooks/useDatabase";
import { supabase, uploadPortfolioAsset } from "@/integrations/neon/client";

const AdminProfile = () => {
  const { toast } = useToast();
  const { user } = useAuthUser();
  const { profilePhoto, setProfilePhoto, updateProfile } = useSiteSettings();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "", title: "", bio: "", email: "", phone: "", location: "", linkedin: "", github: ""
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);
    const { data } = await supabase.from('users').select('*').eq('id', user!.id).single();
    const profile = data as { full_name?: string; title?: string; bio?: string; email?: string; phone?: string; location?: string; linkedin_url?: string; github_url?: string; avatar_url?: string } | null;
    if (profile) {
      updateProfile({ name: profile.full_name || "", title: profile.title || "", bio: profile.bio || "", email: profile.email || "", phone: profile.phone || "", location: profile.location || "", linkedin: profile.linkedin_url || "", github: profile.github_url || "" });
      setForm({
        name: profile.full_name || "", title: profile.title || "", bio: profile.bio || "",
        email: profile.email || "", phone: profile.phone || "", location: profile.location || "",
        linkedin: profile.linkedin_url || "", github: profile.github_url || ""
      });
      if (profile.avatar_url) setProfilePhoto(profile.avatar_url);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    try {
      const { publicUrl } = await uploadPortfolioAsset(file, "profile");
      setProfilePhoto(publicUrl);
      toast({ title: "Photo updated", description: "Profile photo stored in Neon." });
    } catch (error) {
      toast({ title: "Photo upload failed", description: error instanceof Error ? error.message : "Upload failed", variant: "destructive" });
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto("");
    toast({ title: "Photo removed", description: "The profile photo was removed." });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('users').upsert({
        id: user.id,
        full_name: form.name,
        title: form.title,
        bio: form.bio,
        email: form.email,
        phone: form.phone,
        location: form.location,
        linkedin_url: form.linkedin,
        github_url: form.github,
        avatar_url: profilePhoto || null,
      });
      
      if (error) throw error;
      updateProfile({ name: form.name, title: form.title, bio: form.bio, email: form.email, phone: form.phone, location: form.location, linkedin: form.linkedin, github: form.github });
      await loadProfile();
      toast({ title: "Profile Saved!" });
    } catch (e: any) {
      toast({ title: "Error saving profile", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">Profile</h1>
      <div className="card-surface space-y-6">
        {/* Profile Photo */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            {profilePhoto ? (
              <img
                src={profilePhoto}
                alt="Profile"
                loading="lazy"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.style.display = "none";
                  setProfilePhoto("");
                }}
                className="w-24 h-24 rounded-xl object-cover border-2 border-border bg-muted"
              />
            ) : (
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border bg-muted flex items-center justify-center">
                <Camera size={24} className="text-muted-foreground" />
              </div>
            )}
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <Camera size={20} className="text-white" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Profile Photo</p>
            <p className="text-xs text-muted-foreground">This appears in the hero section and resume. Hover to change.</p>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => fileRef.current?.click()}>
                <Camera size={12} /> Change
              </Button>
              {profilePhoto && (
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-destructive" onClick={handleRemovePhoto}>
                  <Trash2 size={12} /> Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input name="name" value={form.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input name="title" value={form.title} onChange={handleChange} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Bio</label>
          <Textarea name="bio" value={form.bio} onChange={handleChange} rows={4} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input name="email" type="email" value={form.email} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input name="phone" value={form.phone} onChange={handleChange} />
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Input name="location" value={form.location} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">LinkedIn</label>
            <Input name="linkedin" value={form.linkedin} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">GitHub</label>
            <Input name="github" value={form.github} onChange={handleChange} />
          </div>
        </div>
        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;