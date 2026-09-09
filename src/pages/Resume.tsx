import { useRef, useState, useCallback } from "react";
import { Download, ArrowLeft, FileText, FileDown, FileImage, LayoutTemplate } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import PageTransition from "@/components/portfolio/PageTransition";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import ResumeClassic from "@/components/resume/ResumeClassic";
import ResumeModern from "@/components/resume/ResumeModern";
import ResumeCreative from "@/components/resume/ResumeCreative";
import ResumeTwoColumn from "@/components/resume/ResumeTwoColumn";
import ResumeProfessional from "@/components/resume/ResumeProfessional";
import { useResumeData } from "@/components/resume/useResumeData";

const templates = [
  { id: "modern", label: "Modern Minimal", description: "Sleek & clean with whitespace" },
  { id: "classic", label: "Classic", description: "Traditional serif-based formality" },
  { id: "creative", label: "Creative Bold", description: "Colorful accents & unique layout" },
  { id: "twocolumn", label: "Two-Column", description: "Sidebar with skills & compact body" },
  { id: "professional", label: "Professional", description: "Formal single-column application layout" },
] as const;

type TemplateId = (typeof templates)[number]["id"];

const formatOptions = [
  { id: "pdf" as const, label: "PDF Document", description: "Best for printing and sharing professionally", icon: FileText },
  { id: "word" as const, label: "Word Document", description: "Editable format for further customization", icon: FileDown },
  { id: "image" as const, label: "Image (PNG)", description: "Quick snapshot for social media or previews", icon: FileImage },
];

type FormatId = (typeof formatOptions)[number]["id"];

function printResume(element: HTMLElement | null) {
  if (!element) throw new Error("Resume preview is not ready yet.");
  const printWindow = window.open("", "_blank", "width=900,height=1200");
  if (!printWindow) throw new Error("Please allow pop-ups to download the resume.");

  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((style) => style.outerHTML)
    .join("\n");
  const resume = element.cloneNode(true) as HTMLElement;
  resume.removeAttribute("style");
  resume.classList.remove("shadow-xl", "rounded-lg", "overflow-hidden");

  printWindow.document.write(`<!doctype html>
    <html><head><meta charset="utf-8"><title>Resume</title>${styles}
    <style>
      @page { size: A4; margin: 0; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body { color: #1a1a1a; }
      .resume-template { width: 100%; max-width: 100%; box-shadow: none !important; border-radius: 0 !important; overflow: visible !important; opacity: 1 !important; visibility: visible !important; transform: none !important; zoom: 0.96; }
      .resume-template * { opacity: 1 !important; visibility: visible !important; transform: none !important; }
    </style></head><body>${resume.outerHTML}</body></html>`);
  printWindow.document.close();
  printWindow.focus();
  window.setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}

const Resume = () => {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>("modern");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { resumeUrl, resumeName, profilePhoto, accentHex } = useSiteSettings();
  const { data: resumeData, loading: resumeLoading, error: resumeError } = useResumeData();

  const handleFormatSelect = useCallback(
    async (format: FormatId) => {
      setDownloading(true);

      if (resumeUrl && (format === "pdf" || format === "word")) {
        const a = document.createElement("a");
        a.href = resumeUrl;
        a.download = resumeName || `resume.${format === "pdf" ? "pdf" : "docx"}`;
        a.click();
        setDownloading(false);
        setDialogOpen(false);
        return;
      }

      if (format === "pdf" || format === "image") {
        setDialogOpen(false);
        try {
          printResume(resumeRef.current?.querySelector(".resume-template") as HTMLElement | null);
        } catch (error) {
          toast({ title: "Download failed", description: error instanceof Error ? error.message : "Unable to prepare the resume.", variant: "destructive" });
        } finally {
          setDownloading(false);
        }
        return;
      }

      if (format === "word") {
        const html = resumeRef.current?.innerHTML || "";
        const blob = new Blob(
          [
            `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><style>body{font-family:Arial,sans-serif;font-size:12px;color:#222;max-width:700px;margin:0 auto;padding:20px}h1{font-size:22px;margin:0}h2{font-size:14px;text-transform:uppercase;letter-spacing:2px;border-bottom:1px solid #ccc;padding-bottom:4px;margin-top:16px}h3{font-size:13px;margin:0}p,li,span{font-size:11px;line-height:1.5}</style></head>
            <body>${html}</body></html>`,
          ],
          { type: "application/msword" }
        );
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "resume.doc";
        link.click();
        setDownloading(false);
        setDialogOpen(false);
        return;
      }

      setDownloading(false);
      setDialogOpen(false);
    },
    [resumeUrl, resumeName]
  );

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case "classic":
        return <ResumeClassic profilePhoto={profilePhoto} accent={accentHex} data={resumeData} />;
      case "creative":
        return <ResumeCreative profilePhoto={profilePhoto} accent={accentHex} data={resumeData} />;
      case "twocolumn":
        return <ResumeTwoColumn profilePhoto={profilePhoto} accent={accentHex} data={resumeData} />;
      case "professional":
        return <ResumeProfessional profilePhoto={profilePhoto} accent={accentHex} data={resumeData} />;
      default:
        return <ResumeModern profilePhoto={profilePhoto} accent={accentHex} data={resumeData} />;
    }
  };

  return (
    <PageTransition>
      <>
        {/* Top bar */}
        <div className="print:hidden fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} /> Back to Portfolio
            </Link>
            <Button onClick={() => setDialogOpen(true)} size="sm" className="gap-2">
              <Download size={16} /> Download Resume
            </Button>
          </div>
        </div>

        {/* Template selector bar */}
        <div className="print:hidden fixed top-16 left-0 right-0 z-40 bg-muted/80 backdrop-blur-sm border-b border-border">
          <div className="max-w-5xl mx-auto px-6 py-3">
            <div className="flex items-center gap-3">
              <LayoutTemplate size={16} className="text-muted-foreground flex-shrink-0" />
              <div className="flex gap-2 overflow-x-auto">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                      selectedTemplate === t.id
                        ? "bg-background border-primary shadow-sm text-foreground"
                        : "bg-transparent border-transparent text-muted-foreground hover:bg-background/50 hover:text-foreground"
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: accentHex }}
                    />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resume preview */}
        <div className="resume-print-root pt-32 pb-16 print:pt-0 print:pb-0 bg-muted/30 print:bg-white min-h-screen">
          <div className="max-w-4xl mx-auto print:max-w-full">
            {resumeError && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive print:hidden">
                Resume data could not be loaded: {resumeError.message}
              </div>
            )}
            {resumeLoading && (
              <div className="mb-4 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted-foreground print:hidden">
                Loading your resume data...
              </div>
            )}
            <div ref={resumeRef}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTemplate}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="resume-template shadow-xl print:shadow-none rounded-lg print:rounded-none overflow-hidden"
                >
                  {renderTemplate()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Format Selection Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md print:hidden">
            <DialogHeader>
              <DialogTitle>Download Resume</DialogTitle>
              <DialogDescription>
                Template: <span className="font-medium text-foreground">{templates.find((t) => t.id === selectedTemplate)?.label}</span> — Choose format
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-2">
              {formatOptions.map((opt) => (
                <button
                  key={opt.id}
                  disabled={downloading}
                  onClick={() => handleFormatSelect(opt.id)}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <opt.icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </>
    </PageTransition>
  );
};

export default Resume;