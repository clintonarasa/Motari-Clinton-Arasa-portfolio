import { supabase } from '@/integrations/neon/client';

// ============================================================================
// SKILLS
// ============================================================================

export const skillsService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('user_id', userId)
      .order('category', { ascending: true });
    if (error) throw error;
    return data;
  },

  async create(userId: string, skill: any) {
    const { data, error } = await supabase
      .from('skills')
      .insert([{ ...skill, user_id: userId }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id: string, skill: any) {
    const { data, error } = await supabase
      .from('skills')
      .update(skill)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================================================
// EXPERIENCE
// ============================================================================

export const experienceService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(userId: string, experience: any) {
    const { data, error } = await supabase
      .from('experience')
      .insert([{ ...experience, user_id: userId }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id: string, experience: any) {
    const { data, error } = await supabase
      .from('experience')
      .update(experience)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase.from('experience').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================================================
// PROJECTS
// ============================================================================

export const projectsService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getFeatured(limit = 6) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('featured', true)
      .order('display_order', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async create(userId: string, project: any) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ ...project, user_id: userId }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id: string, project: any) {
    const { data, error } = await supabase
      .from('projects')
      .update(project)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================================================
// EDUCATION
// ============================================================================

export const educationService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('user_id', userId)
      .order('end_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(userId: string, education: any) {
    const { data, error } = await supabase
      .from('education')
      .insert([{ ...education, user_id: userId }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id: string, education: any) {
    const { data, error } = await supabase
      .from('education')
      .update(education)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase.from('education').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================================================
// CERTIFICATIONS
// ============================================================================

export const certificationsService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('user_id', userId)
      .order('issued_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(userId: string, certification: any) {
    const { data, error } = await supabase
      .from('certifications')
      .insert([{ ...certification, user_id: userId }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id: string, certification: any) {
    const { data, error } = await supabase
      .from('certifications')
      .update(certification)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================================================
// AWARDS
// ============================================================================

export const awardsService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('awards')
      .select('*')
      .eq('user_id', userId)
      .order('awarded_date', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(userId: string, award: any) {
    const { data, error } = await supabase
      .from('awards')
      .insert([{ ...award, user_id: userId }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id: string, award: any) {
    const { data, error } = await supabase
      .from('awards')
      .update(award)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase.from('awards').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================================================
// HOBBIES
// ============================================================================

export const hobbiesService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('hobbies')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async create(userId: string, hobby: any) {
    const { data, error } = await supabase
      .from('hobbies')
      .insert([{ ...hobby, user_id: userId }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id: string, hobby: any) {
    const { data, error } = await supabase
      .from('hobbies')
      .update(hobby)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase.from('hobbies').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================================================
// REFERENCES
// ============================================================================

export const referencesService = {
  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('references')
      .select('*')
      .eq('user_id', userId);
    if (error) throw error;
    return data;
  },

  async create(userId: string, reference: any) {
    const { data, error } = await supabase
      .from('references')
      .insert([{ ...reference, user_id: userId }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id: string, reference: any) {
    const { data, error } = await supabase
      .from('references')
      .update(reference)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase.from('references').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================================================
// BLOG POSTS
// ============================================================================

export const blogService = {
  async getPublished(limit = 10) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getAll(userId: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async create(userId: string, post: any) {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([{ ...post, user_id: userId }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async update(id: string, post: any) {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(post)
      .eq('id', id)
      .select();
    if (error) throw error;
    return data[0];
  },

  async delete(id: string) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  }
};

// ============================================================================
// NEWSLETTER
// ============================================================================

export const newsletterService = {
  async subscribe(email: string) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }])
      .select();
    if (error) throw error;
    return data[0];
  }
};

// ============================================================================
// USER PROFILE
// ============================================================================

export const userService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();
    if (error) throw error;
    return data[0];
  },

  async createProfile(userId: string, profile: any) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ id: userId, ...profile }])
      .select();
    if (error) throw error;
    return data[0];
  }
};
