import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserCheck, Loader2, Phone } from "lucide-react";
import { supabase } from "@/integrations/neon/client";

const ReferencesSection = () => {
  const [dbReferences, setDbReferences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferences = async () => {
      const { data } = await supabase.from('references').select('*').order('created_at', { ascending: false });
      if (data) setDbReferences(data);
      setLoading(false);
    };
    fetchReferences();
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
        References
      </motion.h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-8">
          {dbReferences.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, type: "spring", bounce: 0.3 }}
            whileHover={{ y: -4, boxShadow: "0 12px 24px -8px hsl(var(--primary) / 0.1)" }}
            className="card-surface flex items-start gap-4 transition-shadow"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"
            >
              <UserCheck size={18} className="text-secondary-foreground" />
            </motion.div>
            <div>
              <h3 className="font-display text-lg">{r.name}</h3>
              <p className="text-sm text-muted-foreground">{r.position || r.title}</p>
              {r.company && <p className="text-sm text-foreground/70">{r.company}</p>}
              <p className="text-sm text-primary mt-1">{r.email || r.contact}</p>
              {r.phone && <p className="flex items-center gap-1 text-sm text-muted-foreground mt-1"><Phone size={13} /> {r.phone}</p>}
            </div>
          </motion.div>
        ))}
      </div>
      )}
    </div>
  </section>
  );
};

export default ReferencesSection;
