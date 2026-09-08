import { motion } from "framer-motion";
import { Code2, Cloud, Handshake, GraduationCap } from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "Web Development",
    description:
      "Building performant, accessible web applications with modern frameworks like React, Next.js, and TypeScript — from MVPs to enterprise-scale platforms.",
  },
  {
    icon: Cloud,
    title: "Cloud Architecture",
    description:
      "Designing and deploying scalable cloud infrastructure on AWS & GCP, including microservices, containerization, and CI/CD pipelines.",
  },
  {
    icon: Handshake,
    title: "Consulting",
    description:
      "Providing strategic technical guidance to startups and teams — architecture reviews, tech stack selection, and performance audits.",
  },
  {
    icon: GraduationCap,
    title: "Mentoring",
    description:
      "Coaching junior and mid-level developers through 1-on-1 sessions, code reviews, and career growth planning.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const ServicesSection = () => (
  <section className="px-6 pb-20 md:px-12 lg:px-24 lg:pb-28">
    <div className="max-w-6xl mx-auto">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-primary font-semibold tracking-[0.2em] uppercase text-xs mb-3 text-center"
      >
        What I Do
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="section-title text-center"
      >
        Services Offered
      </motion.h2>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {services.map((s) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              variants={item}
              whileHover={{ y: -6, transition: { duration: 0.25 } }}
              className="card-surface flex flex-col items-start gap-4 group hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-display tracking-tight">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  </section>
);

export default ServicesSection;
