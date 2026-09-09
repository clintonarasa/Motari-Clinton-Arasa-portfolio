import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { personalInfo } from "@/data/portfolio-data";
import { supabase } from "@/integrations/neon/client";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

const ContactSection = () => {
  const { toast } = useToast();
  const { profile: sharedProfile } = useSiteSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data } = await supabase.from('users').select('*').eq('is_admin', true).limit(1).single();
      if (data) setProfile(data);
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok && response.status !== 202) throw new Error(result.error || "Unable to send your message.");
      toast({
        title: response.status === 202 ? "Message received" : "Message sent!",
        description: response.status === 202
          ? "Your message was saved. Email delivery is being configured."
          : "Thank you for reaching out. I'll get back to you soon.",
      });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({ title: "Message not sent", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="section-padding bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Get In Touch
        </motion.h2>

        <div className="grid md:grid-cols-5 gap-12">
          {/* Info column */}
          <motion.div
            className="md:col-span-2 space-y-8"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-muted-foreground leading-relaxed">
              Have a project in mind or just want to say hello? Feel free to drop me a message. I'm always open to new opportunities and collaborations.
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <a href={`mailto:${profile?.email || sharedProfile.email || personalInfo.email}`} className="text-foreground hover:text-primary transition-colors">
                    {profile?.email || sharedProfile.email || personalInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="text-foreground">{profile?.location || sharedProfile.location || personalInfo.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-foreground">{profile?.phone || sharedProfile.phone || personalInfo.phone || "Available on request"}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form column */}
          <motion.form
            onSubmit={handleSubmit}
            className="md:col-span-3 card-surface space-y-5"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Name <span className="text-primary">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email <span className="text-primary">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={handleChange}
                  maxLength={255}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</label>
              <Input
                id="subject"
                name="subject"
                placeholder="What's this about?"
                value={form.subject}
                onChange={handleChange}
                maxLength={200}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-foreground">
                Message <span className="text-primary">*</span>
              </label>
              <Textarea
                id="message"
                name="message"
                placeholder="Your message..."
                rows={5}
                value={form.message}
                onChange={handleChange}
                maxLength={1000}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2 w-full sm:w-auto">
              <Send size={16} />
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
