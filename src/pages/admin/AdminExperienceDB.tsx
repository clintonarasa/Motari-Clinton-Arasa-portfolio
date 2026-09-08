import { useState, useEffect } from 'react';
import { useAuthUser } from '@/hooks/useDatabase';
import { experienceService } from '@/integrations/supabase/services';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Experience {
  id: string;
  user_id: string;
  company_name: string;
  position: string;
  start_date: string;
  end_date: string | null;
  description: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminExperienceDB() {
  const { user } = useAuthUser();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    position: '',
    start_date: '',
    end_date: '',
    description: '',
    is_current: false,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load experiences on mount
  useEffect(() => {
    if (!user) return;
    loadExperiences();
  }, [user]);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const data = await experienceService.getAll(user!.id);
      setExperiences(data || []);
      setSynced(true);
    } catch (error) {
      toast.error('Failed to load experiences');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      if (editingId) {
        // Update existing
        await experienceService.update(editingId, {
          company: formData.company_name,
          title: formData.position,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          description: formData.description,
          is_current: formData.is_current,
        });
        toast.success('Experience updated!');
      } else {
        // Create new
        const newExperience = await experienceService.create(user.id, {
          company: formData.company_name,
          title: formData.position,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          description: formData.description,
          is_current: formData.is_current,
        });
        setExperiences([...experiences, newExperience]);
        toast.success('Experience added!');
      }

      // Reset form
      setFormData({
        company_name: '',
        position: '',
        start_date: '',
        end_date: '',
        description: '',
        is_current: false,
      });
      setEditingId(null);
      await loadExperiences();
    } catch (error) {
      toast.error(editingId ? 'Failed to update experience' : 'Failed to add experience');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (experience: Experience) => {
    setFormData({
      company_name: experience.company,
      position: experience.title,
      start_date: experience.start_date,
      end_date: experience.end_date || '',
      description: experience.description,
      is_current: experience.is_current,
    });
    setEditingId(experience.id);
    window.scrollTo(0, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;

    try {
      setLoading(true);
      await experienceService.delete(id);
      setExperiences(experiences.filter((e) => e.id !== id));
      toast.success('Experience deleted!');
    } catch (error) {
      toast.error('Failed to delete experience');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      company_name: '',
      position: '',
      start_date: '',
      end_date: '',
      description: '',
      is_current: false,
    });
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
        <h1 className="text-3xl font-bold">Experience</h1>
        {!synced && <span className="text-xs text-gray-500">Syncing...</span>}
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Experience' : 'Add New Experience'}</CardTitle>
          <CardDescription>Enter your professional experience details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Company</label>
                <Input
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Company name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Job title"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  disabled={formData.is_current}
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_current}
                  onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Currently working here</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your responsibilities and achievements"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Experience' : 'Add Experience'}
              </Button>
              {editingId && <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Experiences</h2>
        {loading && !experiences.length ? (
          <p className="text-gray-500">Loading experiences...</p>
        ) : experiences.length === 0 ? (
          <p className="text-gray-500">No experiences yet. Add your first one above!</p>
        ) : (
          <div className="grid gap-4">
            {experiences.map((exp) => (
              <Card key={exp.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{exp.title}</h3>
                      <p className="text-sm text-gray-600">{exp.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(exp.start_date).toLocaleDateString()} -
                        {exp.is_current ? ' Present' : ` ${new Date(exp.end_date!).toLocaleDateString()}`}
                      </p>
                      <p className="text-sm mt-2">{exp.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(exp)}
                        disabled={loading}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(exp.id)}
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
