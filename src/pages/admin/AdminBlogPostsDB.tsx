import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Loader2, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuthUser } from "@/hooks/useDatabase";
import { supabase } from "@/integrations/neon/client";

export default function AdminBlogPostsDB() {
  const { toast } = useToast();
  const { user } = useAuthUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    excerpt: "",
    content: "",
    readTime: "5 min read",
    published: false,
    tags: [] as string[],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (user) loadPosts();
  }, [user]);

  const loadPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
    if (data) setPosts(data);
    setLoading(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    // Auto-generate slug for new posts
    if (!editingId) {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setForm((prev) => ({ ...prev, title, slug }));
    } else {
      setForm((prev) => ({ ...prev, title }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
    }
    setTagInput("");
  };

  const removeTag = (tagToRemove: string) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSave = async () => {
    if (!user) return;
    if (!form.title.trim() || !form.slug.trim()) {
      toast({ title: "Title and slug are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const postData = {
        title: form.title,
        slug: form.slug,
        category: form.category,
        excerpt: form.excerpt,
        content: form.content,
        read_time: form.readTime || null,
        published: form.published,
        tags: form.tags,
        user_id: user.id,
        published_at: form.published ? new Date().toISOString() : null,
      };

      if (editingId) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', editingId);
        if (error) throw error;
        toast({ title: "Blog post updated!" });
      } else {
        const { error } = await supabase.from('blog_posts').insert([postData]);
        if (error) throw error;
        toast({ title: "Blog post created!" });
      }
      
      setEditingId(null);
      setForm({ title: "", slug: "", category: "", excerpt: "", content: "", readTime: "5 min read", published: false, tags: [] });
      await loadPosts();
    } catch (error: any) {
      toast({ title: "Error saving post", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (post: any) => {
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      category: post.category || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      readTime: post.read_time || "5 min read",
      published: post.published || false,
      tags: post.tags || [],
    });
    setEditingId(post.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Post deleted" });
      loadPosts();
    } catch (error: any) {
      toast({ title: "Error deleting post", description: error.message, variant: "destructive" });
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm({ title: "", slug: "", category: "", excerpt: "", content: "", readTime: "5 min read", published: false, tags: [] });
  };

  if (!user) return <div className="p-6">Please log in to manage blog posts.</div>;

  return (
    <div className="max-w-5xl">
      <h1 className="font-display text-3xl mb-6">Blog Articles (Database)</h1>

      <div className="card-surface space-y-4 mb-8">
        <h2 className="text-xl font-semibold">{editingId ? "Edit Post" : "Write New Post"}</h2>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input value={form.title} onChange={handleTitleChange} placeholder="Post Title" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">URL Slug</label>
            <Input value={form.slug} onChange={(e) => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="post-url-slug" />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <Input value={form.category} onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Tutorial, Architecture" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Read Time</label>
            <Input value={form.readTime} onChange={(e) => setForm(p => ({ ...p, readTime: e.target.value }))} placeholder="e.g. 5 min read" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Excerpt</label>
          <Textarea value={form.excerpt} onChange={(e) => setForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short description for the blog card..." rows={2} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Content (Markdown supported)</label>
          <Textarea value={form.content} onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Write your blog post content here..." rows={12} className="font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Add a tag..." />
            <Button type="button" variant="outline" onClick={addTag}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {form.tags.map(tag => (
              <span key={tag} className="tag-pill flex items-center gap-1">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-destructive"><X size={14} /></button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm(p => ({ ...p, published: e.target.checked }))} className="w-4 h-4 rounded border-gray-300" />
          <label htmlFor="published" className="text-sm font-medium">Publish immediately</label>
        </div>
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
            {editingId ? "Update Post" : "Save Post"}
          </Button>
          {editingId && (
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Articles</h2>
        {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-primary" /></div> : (
          posts.length === 0 ? <p className="text-muted-foreground">No posts found. Write your first one above!</p> :
          posts.map(post => (
            <div key={post.id} className="card-surface flex items-start justify-between p-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{post.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${post.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">/{post.slug}</p>
                <p className="text-sm text-foreground/80 line-clamp-2">{post.excerpt}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(post)}><Edit2 size={14} /></Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(post.id)}><Trash2 size={14} /></Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}