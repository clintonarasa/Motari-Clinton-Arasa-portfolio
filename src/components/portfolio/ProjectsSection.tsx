import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/neon/client";
import { Link } from "react-router-dom";

const ProjectsSection = () => {
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setDbProjects(data);
      setLoading(false);
    };
    fetchProjects();
  }, []);

  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Projects
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-8">
          {loading ? (
            <div className="flex justify-center py-12 md:col-span-2">
              <Loader2 className="animate-spin text-primary" size={32} />
            </div>
          ) : (
            dbProjects.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{
                y: -6,
                boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.15)",
                borderColor: "hsl(var(--primary) / 0.4)",
              }}
              className="card-surface group transition-all duration-300 overflow-hidden"
            >
              {/* Screenshot */}
              {(p.image_url || p.screenshot) && (
                <motion.div
                  className="-mx-6 -mt-6 mb-4 overflow-hidden cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setLightbox(p.image_url || p.screenshot)}
                >
                  <img
                    src={p.image_url || p.screenshot}
                    alt={`${p.name} screenshot`}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </motion.div>
              )}
              {p.video_url && (
                <video src={p.video_url} controls className="w-full rounded-lg mb-4" preload="metadata" />
              )}

              <div className="flex items-start justify-between mb-3">
                <h3 className="text-xl">
                  <Link to={`/projects/${p.id}`} className="hover:text-primary transition-colors">
                    {p.name}
                  </Link>
                </h3>
                <Link to={`/projects/${p.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.2, rotate: -12 }}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ArrowRight size={18} />
                  </motion.div>
                </Link>
              </div>
              {(p.role || p.featured) && (
                <p className="text-sm text-primary font-medium mb-2">
                  {p.role || "Featured Project"}
                </p>
              )}
              <p className="text-foreground/70 text-sm leading-relaxed mb-4">{p.description}</p>
              <div className="flex flex-wrap gap-2">
                {p.technologies?.map((t: string) => (
                  <span key={t} className="tag-pill text-xs">{t}</span>
                ))}
              </div>
            </motion.div>
          )))}
        </div>
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
              alt="Project screenshot"
              className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default ProjectsSection;
