import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/neon/client";

const AwardsSection = () => {
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAwards = async () => {
      const { data } = await supabase.from('awards').select('*').order('created_at', { ascending: false });
      if (data) setAwards(data);
      setLoading(false);
    };
    fetchAwards();
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
        Awards & Recognitions
      </motion.h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {awards.map((a, i) => (
          <motion.div
            key={a.id || i}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, type: "spring", bounce: 0.3 }}
            whileHover={{ scale: 1.03, y: -4, boxShadow: "0 12px 30px -10px hsl(var(--primary) / 0.15)" }}
            className="card-surface flex items-center gap-4 transition-shadow"
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
            >
              <Trophy size={18} className="text-primary" />
            </motion.div>
            <div>
              <span className="text-foreground/80 font-medium block">{a.title || a}</span>
              {a.issuer && (
                <span className="text-xs text-muted-foreground block mt-0.5">{a.issuer}</span>
              )}
            </div>
          </motion.div>
          ))}
        </div>
      )}
    </div>
  </section>
  );
};

export default AwardsSection;
