import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/neon/client";

const ExperienceSection = () => {
  const [workExperience, setWorkExperience] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperience = async () => {
      const { data } = await supabase
        .from('experience')
        .select('*')
        .order('start_date', { ascending: false });
      
      if (data) setWorkExperience(data);
      setLoading(false);
    };
    fetchExperience();
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
        Work Experience
      </motion.h2>
      <div className="space-y-12">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          workExperience.map((job, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15, type: "spring", bounce: 0.2 }}
            className="relative pl-8 border-l-2 border-primary/30"
          >
            <motion.div
              className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-primary"
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 + 0.3, type: "spring", bounce: 0.5 }}
            />
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2">
              <h3 className="text-2xl">{job.title || job.position}</h3>
              <span className="text-primary font-medium">{job.company}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {new Date(job.start_date).getFullYear()} - {job.is_current || !job.end_date ? 'Present' : new Date(job.end_date).getFullYear()}
            </p>
            
            {/* Replaced arrays with description text from DB */}
            <p className="text-foreground/80 leading-relaxed whitespace-pre-wrap">{job.description}</p>
            
          </motion.div>
        )))}
      </div>
    </div>
  </section>
  );
};

export default ExperienceSection;
