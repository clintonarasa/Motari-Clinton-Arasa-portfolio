import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/neon/client";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = {
  hidden: { opacity: 0, y: 15, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, bounce: 0.4 } },
};

const SkillsSection = () => {
  const [dbSkills, setDbSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      const { data } = await supabase
        .from('skills')
        .select('*')
        // Order by proficiency so your strongest skills show up first
        .order('proficiency', { ascending: false });

      if (data) setDbSkills(data);
      setLoading(false);
    };
    fetchSkills();
  }, []);

  const technicalSkills = dbSkills.filter((s) => s.category === 'technical');
  const softSkills = dbSkills.filter((s) => s.category === 'soft');

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
        Skills
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
            <h3 className="text-xl font-semibold mb-6 text-primary">Technical Skills</h3>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-wrap gap-3">
              {technicalSkills.map((s) => (
                <motion.span
                  key={s.id}
                  variants={item}
                  whileHover={{ scale: 1.1, y: -3, boxShadow: "0 4px 12px hsl(var(--primary) / 0.2)" }}
                  className={`tag-pill border ${s.is_featured ? 'border-primary bg-primary/10' : 'border-primary/20 bg-primary/5'} text-foreground cursor-default transition-shadow`}
                >
                  {s.skill_name}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold mb-6 text-primary">Soft Skills</h3>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="flex flex-wrap gap-3">
              {softSkills.map((s) => (
                <motion.span
                  key={s.id}
                  variants={item}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className={`tag-pill cursor-default ${s.is_featured ? 'bg-primary/10 text-primary' : ''}`}
                >
                  {s.skill_name}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  </section>
  );
};

export default SkillsSection;
