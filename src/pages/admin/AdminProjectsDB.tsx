import { useState, useEffect } from 'react';
import { useAuthUser } from '@/hooks/useDatabase';
import { projectsService } from '@/integrations/supabase/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { X, Upload, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { uploadPortfolioAsset } from '@/integrations/neon/client';

interface Project {
  id: string;
  user_id: string;
  project_name: string;
  description: string;
  technologies: string[];
  project_url?: string;
  github_url?: string;
  featured: boolean;
  image_url?: string | null;
  video_url?: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminProjectsDB() {
  const { user } = useAuthUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    technologies: [] as string[],
    project_url: '',
    github_url: '',
    featured: false,
    image_url: '',
    video_url: '',
  });
  const [techInput, setTechInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [mediaUploading, setMediaUploading] = useState<'image' | 'video' | null>(null);

  // Load projects on mount
  useEffect(() => {
    if (!user) return;
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getAll(user!.id);
      setProjects(data || []);
      setSynced(true);
    } catch (error) {
      toast.error('Failed to load projects');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTechnology = () => {
    if (techInput.trim()) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()],
      });
      setTechInput('');
    }
  };

  const handleRemoveTechnology = (index: number) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter((_, i) => i !== index),
    });
  };

  const handleMediaUpload = async (kind: 'image' | 'video', file: File) => {
    setMediaUploading(kind);
    try {
      const { publicUrl } = await uploadPortfolioAsset(file, `project-${kind}`);
      setFormData((current) => ({ ...current, [kind === 'image' ? 'image_url' : 'video_url']: publicUrl }));
      toast.success(`${kind === 'image' ? 'Screenshot' : 'Video'} uploaded to Neon`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Media upload failed');
    } finally {
      setMediaUploading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const projectData = {
        name: formData.project_name,
        description: formData.description,
        technologies: formData.technologies,
        live_link: formData.project_url || null,
        github_link: formData.github_url || null,
        featured: formData.featured,
        image_url: formData.image_url || null,
        video_url: formData.video_url || null,
      };

      if (editingId) {
        // Update existing
        await projectsService.update(editingId, projectData);
        toast.success('Project updated!');
      } else {
        // Create new
        const newProject = await projectsService.create(user.id, projectData);
        setProjects([...projects, newProject]);
        toast.success('Project added!');
      }

      // Reset form
      setFormData({
        project_name: '',
        description: '',
        technologies: [],
        project_url: '',
        github_url: '',
        featured: false,
        image_url: '',
        video_url: '',
      });
      setEditingId(null);
      setTechInput('');
      await loadProjects();
    } catch (error) {
      toast.error(editingId ? 'Failed to update project' : 'Failed to add project');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setFormData({
      project_name: project.name,
      description: project.description,
      technologies: project.technologies,
      project_url: project.live_link || '',
      github_url: project.github_link || '',
      featured: project.featured,
      image_url: project.image_url || '',
      video_url: project.video_url || '',
    });
    setEditingId(project.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      setLoading(true);
      await projectsService.delete(id);
      setProjects(projects.filter((p) => p.id !== id));
      toast.success('Project deleted!');
    } catch (error) {
      toast.error('Failed to delete project');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      project_name: '',
      description: '',
      technologies: [],
      project_url: '',
      github_url: '',
      featured: false,
      image_url: '',
      video_url: '',
    });
    setTechInput('');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Please log in to access this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Projects</h1>
        {!synced && <span className="text-xs text-gray-500">Syncing...</span>}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Project' : 'Add New Project'}</CardTitle>
          <CardDescription>Enter your project details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name</label>
              <Input
                value={formData.project_name}
                onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                placeholder="Project name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your project"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Technologies</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  placeholder="e.g., React, Node.js, PostgreSQL"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTechnology();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTechnology} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.technologies.map((tech, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <X
                      size={14}
                      className="cursor-pointer"
                      onClick={() => handleRemoveTechnology(idx)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project URL</label>
                <Input
                  type="url"
                  value={formData.project_url}
                  onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">GitHub URL</label>
                <Input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium">Project Media</label>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 text-sm font-medium"><ImageIcon size={16} /> Screenshot</div>
                  {formData.image_url ? <img src={formData.image_url} alt="Project screenshot preview" className="h-32 w-full rounded-md object-cover" /> : <p className="text-xs text-muted-foreground">No screenshot uploaded</p>}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" className="gap-2" asChild><span><Upload size={14} /> Upload image</span></Button>
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleMediaUpload('image', file); }} />
                    </label>
                    {formData.image_url && <Button type="button" variant="ghost" size="sm" onClick={() => setFormData((current) => ({ ...current, image_url: '' }))}><Trash2 size={14} /></Button>}
                  </div>
                </div>
                <div className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2 text-sm font-medium"><Video size={16} /> Demo video</div>
                  {formData.video_url ? <video src={formData.video_url} controls className="h-32 w-full rounded-md object-cover" /> : <p className="text-xs text-muted-foreground">No video uploaded</p>}
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" className="gap-2" asChild><span><Upload size={14} /> Upload video</span></Button>
                      <input type="file" accept="video/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleMediaUpload('video', file); }} />
                    </label>
                    {formData.video_url && <Button type="button" variant="ghost" size="sm" onClick={() => setFormData((current) => ({ ...current, video_url: '' }))}><Trash2 size={14} /></Button>}
                  </div>
                </div>
              </div>
              {mediaUploading && <p className="text-xs text-muted-foreground">Uploading {mediaUploading}...</p>}
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Featured Project</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Projects</h2>
        {loading && !projects.length ? (
          <p className="text-gray-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500">No projects yet. Add your first one above!</p>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        {project.featured && <Badge>Featured</Badge>}
                      </div>
                      <p className="text-sm mt-2">{project.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-3 text-sm">
                        {project.live_link && (
                          <a href={project.live_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            View Live
                          </a>
                        )}
                        {project.github_link && (
                          <a href={project.github_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(project)}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(project.id)}
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
