import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Code2, Briefcase, GraduationCap, Award, Heart, Users, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  personalInfo, skills, workExperience, projects,
} from "@/data/portfolio-data";
import { supabase } from "@/integrations/neon/client";

const quickLinks = [
  { label: "Edit Profile", href: "/admin/dashboard" },
  { label: "Manage Skills", href: "/admin/skills" },
  { label: "Update Experience", href: "/admin/experience" },
  { label: "Edit Projects", href: "/admin/projects" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

const AdminOverview = () => {
  const now = new Date();
  const lastUpdated = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const lastTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const [profile, setProfile] = useState<any>(null);
  const [dbStats, setDbStats] = useState([
    { label: "Technical Skills", value: 0, icon: Code2, href: "/admin/skills", color: "text-blue-500" },
    { label: "Soft Skills", value: 0, icon: Code2, href: "/admin/skills", color: "text-cyan-500" },
    { label: "Work Positions", value: 0, icon: Briefcase, href: "/admin/experience", color: "text-orange-500" },
    { label: "Projects", value: 0, icon: FolderKanban, href: "/admin/projects", color: "text-green-500" },
    { label: "Education", value: 0, icon: GraduationCap, href: "/admin/education", color: "text-purple-500" },
    { label: "Certifications", value: 0, icon: GraduationCap, href: "/admin/education", color: "text-indigo-500" },
    { label: "Awards", value: 0, icon: Award, href: "/admin/awards", color: "text-yellow-500" },
    { label: "Hobbies", value: 0, icon: Heart, href: "/admin/hobbies", color: "text-pink-500" },
    { label: "References", value: 0, icon: Users, href: "/admin/references", color: "text-teal-500" },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: prof } = await supabase.from('users').select('*').eq('is_admin', true).limit(1).single();
      if (prof) setProfile(prof);

      const getCount = async (table: string, filter?: {col: string, val: any}) => {
        let q = supabase.from(table).select('*', { count: 'exact', head: true });
        if (filter) q = q.eq(filter.col, filter.val);
        const { count } = await q;
        return count || 0;
      };

      const [tech, soft, exp, proj, edu, certs, awd, hob, ref] = await Promise.all([
        getCount('skills', { col: 'category', val: 'technical' }),
        getCount('skills', { col: 'category', val: 'soft' }),
        getCount('experience'),
        getCount('projects'),
        getCount('education'),
        getCount('certifications'),
        getCount('awards'),
        getCount('hobbies'),
        getCount('references')
      ]);

      setDbStats([
        { label: "Technical Skills", value: tech, icon: Code2, href: "/admin/skills", color: "text-blue-500" },
        { label: "Soft Skills", value: soft, icon: Code2, href: "/admin/skills", color: "text-cyan-500" },
        { label: "Work Positions", value: exp, icon: Briefcase, href: "/admin/experience", color: "text-orange-500" },
        { label: "Projects", value: proj, icon: FolderKanban, href: "/admin/projects", color: "text-green-500" },
        { label: "Education", value: edu, icon: GraduationCap, href: "/admin/education", color: "text-purple-500" },
        { label: "Certifications", value: certs, icon: GraduationCap, href: "/admin/education", color: "text-indigo-500" },
        { label: "Awards", value: awd, icon: Award, href: "/admin/awards", color: "text-yellow-500" },
        { label: "Hobbies", value: hob, icon: Heart, href: "/admin/hobbies", color: "text-pink-500" },
        { label: "References", value: ref, icon: Users, href: "/admin/references", color: "text-teal-500" },
      ]);
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {profile?.full_name || personalInfo.name}. Here is an overview of your portfolio content.</p>
      </div>

      {/* Last updated banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10 mb-8"
      >
        <Clock size={18} className="text-primary" />
        <div>
          <p className="text-sm font-medium">Last Updated</p>
          <p className="text-xs text-muted-foreground">{lastUpdated} at {lastTime}</p>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {dbStats.map((s) => (
          <motion.div key={s.label} variants={item}>
            <Link to={s.href} className="block group h-full">
              <Card className="hover:border-primary/40 transition-colors shadow-sm group-hover:shadow-md h-full">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 ${s.color}`}>
                    <s.icon size={24} />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{s.value}</p>
                    <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="font-display text-xl mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((q) => (
            <Link
              key={q.href}
              to={q.href}
              className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all group"
            >
              <span className="text-sm font-medium">{q.label}</span>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminOverview;
