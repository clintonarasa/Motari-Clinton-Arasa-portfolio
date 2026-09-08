import { useState, useRef, useEffect } from "react";
import { Globe, Image, Upload, Trash2, Type, Save, FileText, FileUp, Download, Palette, RotateCcw, Link as LinkIcon, Mail, Github, Linkedin, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import localAuth from "@/integrations/localAuth";
import { useAuthUser } from "@/hooks/useDatabase";
import { supabase, uploadPortfolioAsset } from "@/integrations/neon/client";

function LocalAdminForm({ toast }: { toast: any }) {
  const stored = localAuth.getStoredCreds();
  const [email, setEmail] = useState(stored.email);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    if (!email.trim() || !password) {
      toast({ title: "Invalid", description: "Provide both email and password.", variant: "destructive" });
      return;
    }
    setSaving(true);
    localAuth.setStoredCreds(email.trim(), password);
    setPassword("");
    setSaving(false);
    toast({ title: "Saved", description: "Local admin credentials updated." });
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Admin Email</label>
        <Input autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">New Password</label>
        <Input autoComplete="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <p className="text-xs text-muted-foreground">Leave password blank to keep current password.</p>
      </div>
      <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
        <Save size={14} /> Save Admin Account
      </Button>
    </div>
  );
}

const presetColors = [
  { hex: "#c44d20", label: "Terracotta" },
  { hex: "#2563eb", label: "Royal Blue" },
  { hex: "#059669", label: "Emerald" },
  { hex: "#7c3aed", label: "Violet" },
  { hex: "#db2777", label: "Pink" },
  { hex: "#d97706", label: "Amber" },
  { hex: "#0891b2", label: "Cyan" },
  { hex: "#dc2626", label: "Red" },
  { hex: "#4f46e5", label: "Indigo" },
  { hex: "#16a34a", label: "Green" },
];

const AdminSettings = () => {
  const { toast } = useToast();
  const { user } = useAuthUser();
  const { siteTitle, setSiteTitle, ownerName, setOwnerName, resumeUrl, resumeName, setResume, accentHex, setAccentHex, resetAccent, logoUrl, setLogoUrl, resetLogo, faviconUrl, setFaviconUrl, updateProfile } = useSiteSettings();
  const [titleDraft, setTitleDraft] = useState(siteTitle);
  const [nameDraft, setNameDraft] = useState(ownerName);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const [contactForm, setContactForm] = useState({ email: "", linkedin_url: "", github_url: "" });
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    if (user) {
      supabase.from('users').select('email, linkedin_url, github_url').eq('id', user.id).single().then(({data}) => {
        const profile = data as { email?: string; linkedin_url?: string; github_url?: string } | null;
        if (profile) {
          setContactForm({
            email: profile.email || "",
            linkedin_url: profile.linkedin_url || "",
            github_url: profile.github_url || "",
          });
        }
      });
    }
  }, [user]);

  const handleSaveContact = async () => {
    if (!user) return toast({ title: "Not connected", description: "Enable Cloud to save contact settings.", variant: "destructive" });
    setSavingContact(true);
    const { error } = await supabase.from('users').update(contactForm).eq('id', user.id);
    setSavingContact(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      updateProfile({ email: contactForm.email, linkedin: contactForm.linkedin_url, github: contactForm.github_url });
      toast({ title: "Contact info saved", description: "Your social links and email have been updated." });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    try {
      const { publicUrl } = await uploadPortfolioAsset(file, "logo");
      setLogoUrl(publicUrl);
      toast({ title: "Logo updated", description: "Logo stored in Neon." });
    } catch (error) {
      toast({ title: "Logo upload failed", description: error instanceof Error ? error.message : "Upload failed", variant: "destructive" });
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    try {
      const { publicUrl } = await uploadPortfolioAsset(file, "favicon");
      setFaviconPreview(publicUrl);
      setFaviconUrl(publicUrl);
      toast({ title: "Favicon updated", description: "Favicon stored in Neon." });
    } catch (error) {
      toast({ title: "Favicon upload failed", description: error instanceof Error ? error.message : "Upload failed", variant: "destructive" });
    }
  };

  const handleRemoveFavicon = () => {
    setFaviconPreview(null);
    setFaviconUrl(null);
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (link) link.href = "/favicon.ico";
    toast({ title: "Favicon reset", description: "Favicon reverted to default." });
  };

  const handleSaveBranding = () => {
    setSiteTitle(titleDraft);
    setOwnerName(nameDraft);
    toast({ title: "Branding updated", description: "Site title and name updated across the site." });
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Invalid file", description: "Please upload a PDF or Word document.", variant: "destructive" });
      return;
    }
    try {
      const { publicUrl } = await uploadPortfolioAsset(file, "resume");
      setResume(publicUrl, file.name);
      toast({ title: "Resume uploaded", description: `"${file.name}" is stored in Neon.` });
    } catch (error) {
      toast({ title: "Resume upload failed", description: error instanceof Error ? error.message : "Upload failed", variant: "destructive" });
    }
  };

  const handleRemoveResume = () => {
    setResume(null, null);
    toast({ title: "Resume removed", description: "Resume file has been removed." });
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your portfolio configuration, branding, and contact details.</p>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        {/* Site Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Type size={18} className="text-primary" /> Site Branding</CardTitle>
            <CardDescription>Update the browser tab title and navigation name.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Display Name</label>
                <Input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="Your Name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Site Title</label>
                <Input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} placeholder="My Portfolio" />
              </div>
              <Button size="sm" className="gap-2" onClick={handleSaveBranding}>
                <Save size={14} /> Save Branding
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Socials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LinkIcon size={18} className="text-primary" /> Contact & Social Links</CardTitle>
            <CardDescription>Update your email address and main social profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-1.5">
               <label className="text-sm font-medium flex items-center gap-2"><Mail size={14} className="text-muted-foreground"/> Email Address</label>
               <Input value={contactForm.email} onChange={(e) => setContactForm(p => ({...p, email: e.target.value}))} placeholder="hello@example.com" />
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-medium flex items-center gap-2"><Linkedin size={14} className="text-muted-foreground"/> LinkedIn URL</label>
               <Input value={contactForm.linkedin_url} onChange={(e) => setContactForm(p => ({...p, linkedin_url: e.target.value}))} placeholder="https://linkedin.com/in/..." />
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-medium flex items-center gap-2"><Github size={14} className="text-muted-foreground"/> GitHub URL</label>
               <Input value={contactForm.github_url} onChange={(e) => setContactForm(p => ({...p, github_url: e.target.value}))} placeholder="https://github.com/..." />
             </div>
             <Button size="sm" className="gap-2 mt-2" onClick={handleSaveContact} disabled={savingContact}>
               {savingContact ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Contact Info
             </Button>
          </CardContent>
        </Card>

        {/* Theme Color */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette size={18} className="text-primary" /> Theme Color</CardTitle>
            <CardDescription>Choose an accent color that applies across the entire portfolio and resume.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-5">
              {presetColors.map((c) => (
                <button
                  key={c.hex}
                  onClick={() => {
                    setAccentHex(c.hex);
                    toast({ title: `Theme: ${c.label}`, description: "Accent color updated across the site." });
                  }}
                  className={`w-9 h-9 rounded-lg transition-all hover:scale-110 ${
                    accentHex.toLowerCase() === c.hex.toLowerCase()
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "ring-1 ring-border"
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.label}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Custom:</label>
              <div className="relative">
                <input
                  type="color"
                  value={accentHex}
                  onChange={(e) => setAccentHex(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-border"
                />
              </div>
              <Input
                value={accentHex}
                onChange={(e) => {
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) setAccentHex(e.target.value);
                }}
                placeholder="#c44d20"
                className="w-28 font-mono text-sm"
              />
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs" onClick={() => { resetAccent(); toast({ title: "Color reset", description: "Reverted to default terracotta." }); }}>
                <RotateCcw size={12} /> Reset
              </Button>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border space-y-2">
              <p className="text-xs text-muted-foreground font-medium">Live Preview</p>
              <div className="flex items-center gap-3">
                <div className="h-8 w-24 rounded-md bg-primary" />
                <span className="text-sm font-medium text-primary">Accent text</span>
                <Button size="sm">Button element</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Assets (Favicon & Logo) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Image size={18} className="text-primary" /> Site Assets</CardTitle>
            <CardDescription>Manage the images that represent your portfolio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">Favicon</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                  {faviconPreview || faviconUrl ? <img src={faviconPreview || faviconUrl || ""} alt="Favicon preview" className="w-full h-full object-contain" /> : <img src="/favicon.ico" alt="Current favicon" className="w-8 h-8 object-contain" />}
                </div>
                <div className="flex gap-2">
                  <input ref={faviconRef} type="file" accept="image/*" className="hidden" onChange={handleFaviconUpload} />
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => faviconRef.current?.click()}><Upload size={14} /> Upload</Button>
                  {faviconPreview && <Button variant="ghost" size="sm" className="gap-2 text-destructive" onClick={handleRemoveFavicon}><Trash2 size={14} /> Remove</Button>}
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Navigation Logo</p>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                  <img src={logoUrl} alt="Current logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex gap-2">
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => logoRef.current?.click()}><Upload size={14} /> Upload</Button>
                  <Button variant="ghost" size="sm" className="gap-2 text-destructive" onClick={() => { resetLogo(); toast({ title: "Logo reset" }); }}><Trash2 size={14} /> Reset</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText size={18} className="text-primary" /> Resume / CV</CardTitle>
            <CardDescription>Provide a resume for visitors to download.</CardDescription>
          </CardHeader>
          <CardContent>
            {resumeUrl && resumeName ? (
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                <FileText size={28} className="text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{resumeName}</p>
                  <p className="text-xs text-muted-foreground">Ready for download</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <a href={resumeUrl} download={resumeName}>
                    <Button variant="outline" size="sm" className="gap-1.5"><Download size={14} /> Preview</Button>
                  </a>
                  <Button variant="ghost" size="sm" className="gap-1.5 text-destructive" onClick={handleRemoveResume}><Trash2 size={14} /> Remove</Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => resumeRef.current?.click()}>
                <FileUp size={32} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">Click to upload your resume</p>
                <p className="text-xs text-muted-foreground mt-1">PDF or Word document, max 20MB</p>
              </div>
            )}
            <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
          </CardContent>
        </Card>

        {/* System & Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Globe size={18} className="text-primary" /> System & Actions</CardTitle>
            <CardDescription>Manage backend connectivity and general actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <div>
                <p className="font-medium text-sm">Database Connected</p>
                <p className="text-xs text-muted-foreground">Syncing to Neon PostgreSQL.</p>
              </div>
            </div>
            {!localAuth.usingSupabase() && (
              <div className="space-y-3">
                <p className="text-sm font-medium">Local Admin Override</p>
                <LocalAdminForm toast={toast} />
              </div>
            )}
            <div className="pt-2">
              <Link to="/" target="_blank">
                <Button variant="outline" className="gap-2 w-full"><Globe size={16} /> Open Public Portfolio</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;