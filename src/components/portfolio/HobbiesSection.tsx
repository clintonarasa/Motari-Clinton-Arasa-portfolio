import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Code, Mountain, Camera, BookOpen, Trophy, Globe, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/neon/client";

const iconMap: Record<string, React.ReactNode> = {
  Code: <Code size={24} />,
  Mountain: <Mountain size={24} />,
  Camera: <Camera size={24} />,
  BookOpen: <BookOpen size={24} />,
  Trophy: <Trophy size={24} />,
  Globe: <Globe size={24} />,
  Default: <Star size={24} />
};

const HobbiesSection = () => {
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHobbies = async () => {
      const { data } = await supabase.from('hobbies').select('*').order('created_at', { ascending: false });
      if (data) setHobbies(data);
      setLoading(false);
    };
    fetchHobbies();
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
        Hobbies & Interests
      </motion.h2>
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {hobbies.map((h, i) => (
          <motion.div
            key={h.id || i}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, type: "spring", bounce: 0.4 }}
            whileHover={{
              y: -8,
              scale: 1.08,
              borderColor: "hsl(var(--primary) / 0.4)",
              boxShadow: "0 12px 24px -8px hsl(var(--primary) / 0.15)",
            }}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border transition-all cursor-default text-center"
          >
            <motion.div
              whileHover={{ rotate: 10, scale: 1.15 }}
              className="text-primary"
            >
              {iconMap[h.icon] || iconMap.Default}
            </motion.div>
            <span className="text-sm font-medium">{h.name}</span>
          </motion.div>
          ))}
        </div>
      )}
    </div>
  </section>
  );
};

export default HobbiesSection;
