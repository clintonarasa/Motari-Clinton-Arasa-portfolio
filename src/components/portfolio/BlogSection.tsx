import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Clock, BookOpen, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/neon/client";
import { Link } from "react-router-dom";

const categoryColors: Record<string, string> = {
  Architecture: "bg-primary/15 text-primary",
  "Case Study": "bg-accent/15 text-accent-foreground",
  Tutorial: "bg-muted text-muted-foreground",
};

const BlogSection = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        // Fetch the 3 newest articles
        .order('created_at', { ascending: false })
        .limit(3);
        
      if (data) setArticles(data);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  return (
    <section className="section-padding">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-primary font-semibold tracking-widest uppercase text-sm mb-2">
            Blog & Writing
          </p>
          <h2 className="section-title mb-4">Technical Articles</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Thoughts on software architecture, developer experience, and lessons learned from building at scale.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" size={32} /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, i) => (
            <Link to={`/blog/${article.slug || '#'}`} key={article.id || i} className="group block">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: "0 20px 40px -15px hsl(var(--primary) / 0.12)" }}
              className="group card-surface flex flex-col transition-all duration-300 hover:border-primary/30"
            >
              {/* Category badge */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[article.category || 'Tutorial'] || "bg-muted text-muted-foreground"}`}>
                  {article.category || 'Article'}
                </span>
                <ArrowUpRight
                  size={16}
                  className="text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </div>

              {/* Title */}
              <h3 className="font-display text-lg tracking-tight mb-2 group-hover:text-primary transition-colors leading-snug">
                {article.title}
              </h3>

              {/* Excerpt */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                {article.excerpt}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(article.tags || []).map((tag: string) => (
                  <span key={tag} className="tag-pill text-xs">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {new Date(article.published_at || article.created_at || new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} />
                  {article.read_time || '5 min read'}
                </span>
              </div>
            </motion.div>
            </Link>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;
