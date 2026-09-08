import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BadgeCheck, X, ImageIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/neon/client";

function displayDate(value?: string) {
  return value ? value.slice(0, 10) : "";
}

const EducationSection = () => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [dbEducation, setDbEducation] = useState<any[]>([]);
  const [dbCerts, setDbCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: eduData } = await supabase.from('education').select('*').order('start_date', { ascending: false });
      const { data: certData } = await supabase.from('certifications').select('*').order('issued_date', { ascending: false });
      
      if (eduData) setDbEducation(eduData);
      if (certData) setDbCerts(certData);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <section className="section-padding bg-card">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Education & Certifications
        </motion.h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="grid md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><GraduationCap size={20} className="text-primary" /> Education</h3>
            <div className="space-y-6">
              {dbEducation.map((e, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, type: "spring", bounce: 0.3 }}
                >
                  <h4 className="text-lg font-display">{e.field_of_study || e.degree}</h4>
                  <p className="text-primary font-medium text-sm">{e.institution}</p>
                  <p className="text-muted-foreground text-sm">{e.start_date ? `${displayDate(e.start_date)}${e.end_date ? ` - ${displayDate(e.end_date)}` : ""}` : e.dates}</p>
                  {e.degree_level && (
                    <p className="text-xs text-muted-foreground mt-0.5">Level: {e.degree_level}</p>
                  )}
                  {e.certificate_awarded && (
                    <p className="text-xs text-primary/70 mt-0.5">Certificate: {e.certificate_awarded}</p>
                  )}
                  {e.grade && (
                    <p className="text-xs text-accent-foreground/80 mt-1 font-medium">
                      Attained: {e.degree_level === "Primary (KCPE)" ? `${e.grade}/400` : e.grade}
                    </p>
                  )}
                  <p className="text-foreground/70 text-sm mt-1">{e.description || e.details}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2"><BadgeCheck size={20} className="text-primary" /> Certifications</h3>
            <div className="space-y-4">
              {dbCerts.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, type: "spring", bounce: 0.3 }}
                  whileHover={{ x: 5 }}
                  className="card-surface flex items-center gap-4 cursor-default !p-4"
                >
                  {(c.badge_url || c.image) ? (
                    <motion.img
                      src={c.badge_url || c.image}
                      alt={c.name}
                      loading="lazy"
                      className="w-14 h-14 rounded-lg object-cover border border-border cursor-pointer flex-shrink-0"
                      whileHover={{ scale: 1.1 }}
                      onClick={() => setLightbox(c.badge_url || c.image)}
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <ImageIcon size={20} className="text-primary/50" />
                    </div>
                  )}
                  <span className="text-foreground/80 text-sm">{c.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setLightbox(null)}
          >
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80"
              onClick={() => setLightbox(null)}
            >
              <X size={20} />
            </motion.button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={lightbox}
              alt="Certificate"
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default EducationSection;
