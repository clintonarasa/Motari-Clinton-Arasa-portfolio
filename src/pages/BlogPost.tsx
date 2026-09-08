import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '@/integrations/neon/client';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchPost = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Section */}
      <div className="w-full border-b border-border pt-24 pb-16 px-6 bg-card/50">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Articles
          </button>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {post.category || 'Article'}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar size={14} />
                {new Date(post.published_at || post.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock size={14} /> {post.read_time || '5 min read'}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6 leading-tight">
              {post.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-3xl mx-auto px-6 mt-12">
        <ReactMarkdown remarkPlugins={[remarkGfm]} className="prose dark:prose-invert max-w-none text-foreground/80 leading-relaxed sm:text-base sm:font-sans">
          {post.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}