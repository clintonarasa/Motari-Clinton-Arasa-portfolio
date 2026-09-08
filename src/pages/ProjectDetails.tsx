import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/neon/client';

export default function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchProject = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();
        
      if (data) setProject(data);
      setLoading(false);
    };
    
    fetchProject();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-lg text-slate-600 dark:text-slate-400">Loading project details...</p>
      </div>
    );
  }

  if (!project && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Project Not Found</h1>
        <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] pb-20">
      {/* Hero Section */}
      <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-20 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center text-sm text-slate-500 hover:text-blue-600 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </button>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4"
          >
            {project.name}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 dark:text-slate-400 mb-8"
          >
            {project.description}
          </motion.p>

          <div className="flex flex-wrap gap-2 mb-8">
            {project.technologies?.map((tech: string) => (
              <span key={tech} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                {tech}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {project.live_link && (
              <a href={project.live_link} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                <ExternalLink className="w-4 h-4 mr-2" /> Live Demo
              </a>
            )}
            {project.github_link && (
              <a href={project.github_link} target="_blank" rel="noreferrer" className="flex items-center px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors">
                <Github className="w-4 h-4 mr-2" /> Source Code
              </a>
            )}
          </div>
          {(project.image_url || project.video_url) && (
            <div className="mt-8 space-y-4">
              {project.image_url && <img src={project.image_url} alt={`${project.name} screenshot`} className="w-full max-h-[520px] object-cover rounded-xl" />}
              {project.video_url && <video src={project.video_url} controls className="w-full max-h-[520px] rounded-xl" preload="metadata" />}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 mt-12 space-y-12">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">About the Project</h2>
          <p className="text-lg leading-relaxed text-slate-700 dark:text-slate-300 mb-6 whitespace-pre-wrap">
            {project.long_description || project.description}
          </p>
        </section>
      </div>
    </div>
  );
}