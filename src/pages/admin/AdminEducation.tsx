import { useState, useEffect } from "react";
import { Save, Plus, Trash2, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isValid } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  educationLevels,
  certificatesAwarded,
  kcseGrades,
  kcpeScoreRange,
  degreeClasses,
} from "@/data/portfolio-data";
import { supabase, uploadPortfolioAsset } from "@/integrations/neon/client";
import { useAuthUser } from "@/hooks/useDatabase";

type Cert = { name: string; image: string };
const emptyEducation = () => ({ degree: "", institution: "", dates: "", startDate: "", endDate: "", levelOfStudy: "", certificateAwarded: "", grade: "" });
const isEmptyEducation = (item: any) => !item.degree && !item.institution && !item.startDate && !item.endDate && !item.levelOfStudy && !item.certificateAwarded && !item.grade;

function parseDateValue(value?: string) {
  const normalized = normalizeDateValue(value);
  if (!normalized) return undefined;
  const [year, month, day] = normalized.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return isValid(date) && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined;
}

function normalizeDateValue(value?: string) {
  if (!value) return "";
  const candidate = value.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(candidate)) return "";
  const [year, month, day] = candidate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return isValid(date) && date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? candidate : "";
}

function DatePicker({ value, onChange, placeholder, fromDate }: { value?: string; onChange: (value: string) => void; placeholder: string; fromDate?: Date }) {
  const minimumDate = fromDate && isValid(fromDate) ? fromDate : undefined;
  return (
    <Input
      type="date"
      value={value || ""}
      min={minimumDate ? format(minimumDate, "yyyy-MM-dd") : undefined}
      onChange={(event) => onChange(event.target.value)}
      aria-label={placeholder}
      className="w-full"
    />
  );
}

const AdminEducation = () => {
  const { toast } = useToast();
  const { user } = useAuthUser();
  const [edu, setEdu] = useState<any[]>([]);
  const [certs, setCerts] = useState<Cert[]>([]);
  const [newCertName, setNewCertName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedEducation, setExpandedEducation] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    const { data: eduData } = await supabase.from('education').select('*').eq('user_id', user!.id);
    const { data: certData } = await supabase.from('certifications').select('*').eq('user_id', user!.id);
    
    if (eduData) setEdu(eduData.map((item: any) => ({
      ...item,
      degree: item.degree || item.field_of_study || "",
      dates: normalizeDateValue(item.dates || item.start_date),
      startDate: normalizeDateValue(item.startDate || item.start_date),
      endDate: normalizeDateValue(item.endDate || item.end_date),
      levelOfStudy: item.levelOfStudy || item.degree_level || "",
      certificateAwarded: item.certificateAwarded || "",
    })));
    if (certData) setCerts(certData.map((item: any) => ({ ...item, image: item.image || item.badge_url || "" })));
    setLoading(false);
  };

  const updateEdu = (i: number, field: string, value: string) => {
    setEdu((p: any[]) => p.map((e, idx) => idx === i ? { ...e, [field]: value } : e));
  };

  const updateCert = (i: number, field: keyof Cert, value: string) => {
    setCerts((p) => p.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const handleCertImage = async (i: number, file: File) => {
    try {
      const { publicUrl } = await uploadPortfolioAsset(file, "certificate");
      updateCert(i, "image", publicUrl);
      toast({ title: "Image added", description: "Certificate image stored in Neon." });
    } catch (error) {
      toast({ title: "Image upload failed", description: error instanceof Error ? error.message : "Upload failed", variant: "destructive" });
    }
  };

  const handleAddCertification = async () => {
    if (!user || !newCertName.trim()) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('certifications').insert([{
        user_id: user.id,
        name: newCertName.trim(),
        issuer: 'Self-managed',
        issued_date: new Date().toISOString().slice(0, 10),
        badge_url: null,
      }]);
      if (error) throw error;
      setNewCertName("");
      const { data } = await supabase.from('certifications').select('*').eq('user_id', user.id).order('issued_date', { ascending: false });
      if (data) setCerts(data.map((item: any) => ({ ...item, image: item.image || item.badge_url || "" })));
      toast({ title: "Certification added", description: "The certification is now saved and visible on the portfolio." });
    } catch (error) {
      toast({ title: "Error adding certification", description: error instanceof Error ? error.message : "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    const validCerts = certs.filter((cert) => cert.name.trim());
    const educationRows = edu.map((item) => ({
      ...item,
      startDate: normalizeDateValue(item.startDate) || normalizeDateValue(item.dates),
      endDate: normalizeDateValue(item.endDate),
    })).filter((item) => !isEmptyEducation(item));
    const invalidEducation = educationRows.find((item) => {
      const startDate = parseDateValue(item.startDate);
      const endDate = item.endDate ? parseDateValue(item.endDate) : undefined;
      return !item.institution?.trim() || !item.degree?.trim() || !startDate || (item.endDate && !endDate) || (startDate && endDate && endDate < startDate);
    });
    if (invalidEducation) {
      toast({ title: "Check education fields", description: "Enter an institution, program, valid start date, and an end date after the start date.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      // Delete old records and insert new ones
      const { error: educationDeleteError } = await supabase.from('education').delete().eq('user_id', user.id);
      if (educationDeleteError) throw educationDeleteError;
      if (educationRows.length > 0) {
        const { error } = await supabase.from('education').insert(educationRows.map(e => ({
          user_id: user.id,
          institution: e.institution,
          field_of_study: e.degree,
          degree_level: e.levelOfStudy,
          start_date: e.startDate,
          end_date: e.endDate || null,
          grade: e.grade || null,
          description: e.certificateAwarded || null,
        })));
        if (error) throw error;
      }

      const { error: certificationDeleteError } = await supabase.from('certifications').delete().eq('user_id', user.id);
      if (certificationDeleteError) throw certificationDeleteError;
      if (validCerts.length > 0) {
        const { error } = await supabase.from('certifications').insert(validCerts.map(c => ({
          user_id: user.id,
          name: c.name,
          issuer: 'Self-managed',
          issued_date: new Date().toISOString().split('T')[0],
          badge_url: c.image || null,
        })));
        if (error) throw error;
      }
      await loadData();
      setEdu((current) => {
        const nextIndex = current.length;
        setExpandedEducation(new Set([nextIndex]));
        return [...current, emptyEducation()];
      });
      setNewCertName("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast({ title: "Education & Certifications Saved!" });
    } catch (error) {
      toast({ title: "Error saving data", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-6">Education & Certifications</h1>

      {loading ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div> : (
      <div className="space-y-6">
        {/* Education */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary">Education</h2>
            <Button variant="outline" size="sm" onClick={() => setEdu((current) => {
              const nextIndex = current.length;
              setExpandedEducation((expanded) => new Set([...expanded, nextIndex]));
              return [...current, emptyEducation()];
            })} className="gap-1">
              <Plus size={14} /> Add
            </Button>
          </div>
          {edu.map((e: any, i: number) => (
            <div key={i} className={`card-surface ${isEmptyEducation(e) ? "border-primary/40 bg-primary/[0.03]" : ""}`}>
              <button
                type="button"
                onClick={() => setExpandedEducation((expanded) => {
                  const next = new Set(expanded);
                  if (next.has(i)) next.delete(i); else next.add(i);
                  return next;
                })}
                className="flex w-full items-center justify-between text-left"
              >
                <div>
                  <p className="text-sm font-semibold text-primary">{isEmptyEducation(e) ? "New education" : e.degree || "Saved education"}</p>
                  <p className="text-xs text-muted-foreground">{isEmptyEducation(e) ? "Ready for your next entry" : e.institution || "Saved record"}</p>
                </div>
                <span className="text-xs text-muted-foreground">{expandedEducation.has(i) ? "Collapse" : "Expand"}</span>
              </button>
              {expandedEducation.has(i) && <div className="mt-4 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Level of Study</label>
                  <Select value={e.levelOfStudy || ""} onValueChange={(val) => updateEdu(i, "levelOfStudy", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level..." />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((level) => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Certificate Awarded</label>
                  <Select value={e.certificateAwarded || ""} onValueChange={(val) => updateEdu(i, "certificateAwarded", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select certificate..." />
                    </SelectTrigger>
                    <SelectContent>
                      {certificatesAwarded.map((cert) => (
                        <SelectItem key={cert} value={cert}>{cert}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Degree / Program Name</label>
                  <Input value={e.degree} onChange={(ev) => updateEdu(i, "degree", ev.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Institution</label>
                  <Input value={e.institution} onChange={(ev) => updateEdu(i, "institution", ev.target.value)} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Start date</label>
                  <DatePicker value={e.startDate || e.dates} onChange={(value) => updateEdu(i, "startDate", value)} placeholder="Select start date" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">End date</label>
                  <DatePicker value={e.endDate} onChange={(value) => updateEdu(i, "endDate", value)} placeholder="Select end date" fromDate={e.startDate ? new Date(`${e.startDate}T00:00:00`) : undefined} />
                </div>
              </div>
              {/* Conditional grading based on level of study */}
              {e.levelOfStudy === "Secondary (KCSE)" && (
                <div className="space-y-1">
                  <label className="text-xs font-medium">KCSE Grade</label>
                  <Select value={e.grade || ""} onValueChange={(val) => updateEdu(i, "grade", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade..." />
                    </SelectTrigger>
                    <SelectContent>
                      {kcseGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              {e.levelOfStudy === "Primary (KCPE)" && (
                <div className="space-y-1">
                  <label className="text-xs font-medium">KCPE Score ({kcpeScoreRange.min}–{kcpeScoreRange.max})</label>
                  <Input
                    type="number"
                    min={kcpeScoreRange.min}
                    max={kcpeScoreRange.max}
                    value={e.grade || ""}
                    onChange={(ev) => updateEdu(i, "grade", ev.target.value)}
                    placeholder="e.g. 350"
                  />
                </div>
              )}
              {["Certificate", "Diploma", "Degree", "Postgraduate Diploma", "Master's Degree", "Doctorate (PhD)"].includes(e.levelOfStudy) && (
                <div className="space-y-1">
                  <label className="text-xs font-medium">Degree Class</label>
                  <Select value={e.grade || ""} onValueChange={(val) => updateEdu(i, "grade", val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class..." />
                    </SelectTrigger>
                    <SelectContent>
                      {degreeClasses.map((cls) => (
                        <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setEdu((p: any[]) => p.filter((_, idx) => idx !== i))} className="text-destructive">
                  <Trash2 size={14} />
                </Button>
              </div>
              </div>}
            </div>
          ))}
        </div>

        {/* Certifications */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-primary">Certifications</h2>
          {certs.map((c, i) => (
            <div key={i} className="card-surface space-y-3">
              <div className="flex gap-3">
                <Input
                  value={c.name}
                  onChange={(e) => updateCert(i, "name", e.target.value)}
                  placeholder="Certification name"
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" onClick={() => setCerts((p) => p.filter((_, idx) => idx !== i))}>
                  <Trash2 size={14} className="text-destructive" />
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Certificate Image</label>
                {c.image ? (
                  <div className="relative group">
                    <img src={c.image} alt={c.name} className="w-full h-32 object-cover rounded-lg border border-border" loading="lazy" />
                    <button
                      onClick={() => updateCert(i, "image", "")}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/40 transition-colors">
                    <ImageIcon size={20} className="text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Upload certificate image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleCertImage(i, e.target.files[0])}
                    />
                  </label>
                )}
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="New certification name..." value={newCertName} onChange={(e) => setNewCertName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), void handleAddCertification())} />
            <Button variant="outline" size="sm" onClick={() => void handleAddCertification()} disabled={saving || !newCertName.trim()}><Plus size={16} /></Button>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save All
        </Button>
      </div>
      )}
    </div>
  );
};

export default AdminEducation;
