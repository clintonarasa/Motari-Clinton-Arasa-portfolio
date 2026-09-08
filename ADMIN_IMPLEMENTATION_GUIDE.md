# 📋 Admin Pages Implementation Guide

This guide shows how to convert each admin placeholder to connect with the database using the patterns from AdminSkillsDB, AdminExperienceDB, and AdminProjectsDB.

## Pattern Overview

All admin pages follow this structure:

```typescript
1. Import hooks & services
2. Define TypeScript interface for the data type
3. Set up component state (data array, form data, loading)
4. Load data from Supabase on mount
5. Subscribe to real-time changes
6. Handle CRUD operations
7. Reset form after operation
```

---

## 📁 Implementation Checklist

### ✅ Done (Use as Reference)
- [x] AdminSkillsDB.tsx - Skills with proficiency slider
- [x] AdminExperienceDB.tsx - Experience with dates
- [x] AdminProjectsDB.tsx - Projects with URL links

### ⏳ To Implement

#### 1. AdminEducationDB.tsx
**Database Table:** `education`
**Fields:** institution, degree_type, field_of_study, graduation_date, gpa, featured

**Quick Template:**
```typescript
import { educationService } from '@/integrations/supabase/services';
import { useAuthUser } from '@/hooks/useDatabase';

interface Education {
  id: string;
  institution: string;
  degree_type: string;
  field_of_study: string;
  graduation_date: string;
  gpa?: number;
  featured: boolean;
}

export default function AdminEducationDB() {
  const { user } = useAuthUser();
  const [educations, setEducations] = useState<Education[]>([]);
  const [formData, setFormData] = useState({
    institution: '',
    degree_type: '',
    field_of_study: '',
    graduation_date: '',
    gpa: '',
    featured: false,
  });

  // Load data
  useEffect(() => {
    if (!user) return;
    educationService.getAll(user.id).then(setEducations);
  }, [user]);

  // Create/Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await educationService.update(editingId, formData);
    } else {
      const newEd = await educationService.create(user.id, formData);
      setEducations([...educations, newEd]);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    await educationService.delete(id);
    setEducations(educations.filter(e => e.id !== id));
  };

  return (
    <div>
      {/* Form with institution, degree_type, field_of_study, graduation_date, gpa inputs */}
      {/* List of educations */}
    </div>
  );
}
```

**Implementation Steps:**
1. Copy structure from AdminExperienceDB.tsx
2. Replace `experience` with `education`
3. Replace date fields: Add `graduation_date` (single date field)
4. Add `gpa` as decimal input
5. Add checkboxes for `degree_type` selector (Bachelor's, Master's, PhD, etc.)

**Estimated Time:** 15 minutes

---

#### 2. AdminCertificationsDB.tsx
**Database Table:** `certifications`
**Fields:** certification_name, issuing_organization, issue_date, expiration_date, credential_url, featured

**Quick Template:**
```typescript
import { certificationsService } from '@/integrations/supabase/services';

// Similar to education but with:
// - Single certification_name field
// - issuing_organization text
// - issue_date & expiration_date
// - credential_url for verification link
```

**Implementation Steps:**
1. Copy from AdminExperienceDB.tsx
2. Add credential_url field for certificate link
3. Use date inputs for issue/expiration
4. Add expiration alert if expired

**Estimated Time:** 15 minutes

---

#### 3. AdminAwardsDB.tsx
**Database Table:** `awards`
**Fields:** award_name, issuing_organization, award_date, description, featured

**Quick Template:**
```typescript
import { awardsService } from '@/integrations/supabase/services';

// Simpler structure:
// - award_name (text)
// - issuing_organization (text)
// - award_date (date)
// - description (textarea)
// - featured (checkbox)
```

**Implementation Steps:**
1. Copy from AdminExperienceDB.tsx
2. Simplify to just award_name, org, date, description
3. Remove end_date, keep just award_date
4. Add featured toggle

**Estimated Time:** 10 minutes

---

#### 4. AdminHobbiesDB.tsx
**Database Table:** `hobbies`
**Fields:** hobby_name, description, featured

**Quick Template:**
```typescript
import { hobbiesService } from '@/integrations/supabase/services';

// Very simple:
// - hobby_name (text)
// - description (textarea)
// - featured (checkbox)
```

**Copy-Paste Implementation:**
```typescript
import { useState, useEffect } from 'react';
import { useAuthUser } from '@/hooks/useDatabase';
import { hobbiesService } from '@/integrations/supabase/services';

interface Hobby {
  id: string;
  hobby_name: string;
  description: string;
  featured: boolean;
}

export default function AdminHobbiesDB() {
  const { user } = useAuthUser();
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [formData, setFormData] = useState({
    hobby_name: '',
    description: '',
    featured: false,
  });

  useEffect(() => {
    if (!user) return;
    hobbiesService.getAll(user.id).then(setHobbies);
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await hobbiesService.update(editingId, formData);
    } else {
      const newHobby = await hobbiesService.create(user.id, formData);
      setHobbies([...hobbies, newHobby]);
    }
    setFormData({ hobby_name: '', description: '', featured: false });
  };

  return (
    // UI: Text input for hobby_name, textarea for description, checkbox for featured
  );
}
```

**Estimated Time:** 5 minutes

---

#### 5. AdminReferencesDB.tsx
**Database Table:** `references`
**Fields:** reference_name, position, company, email, phone, relationship, featured

**Quick Template:**
```typescript
import { referencesService } from '@/integrations/supabase/services';

// Contact reference form with:
// - reference_name (text)
// - position (text)
// - company (text)
// - email (email input)
// - phone (tel input)
// - relationship (select: Manager, Colleague, Client, etc.)
// - featured (checkbox)
```

**Implementation Steps:**
1. Copy from AdminExperienceDB.tsx
2. Add email/phone fields
3. Add relationship dropdown
4. Validate email format

**Estimated Time:** 15 minutes

---

#### 6. AdminBlogPostsDB.tsx
**Database Table:** `blog_posts`
**Fields:** title, slug, content, excerpt, published, featured, published_at

**Quick Template:**
```typescript
import { blogService } from '@/integrations/supabase/services';

// Blog post form with:
// - title (text)
// - slug (auto-generated from title or editable)
// - excerpt (short textarea)
// - content (long textarea or markdown editor)
// - published (checkbox or select: Draft/Published)
// - featured (checkbox)
// - published_at (datetime)
```

**Implementation Steps:**
1. Copy from AdminProjectsDB.tsx
2. Add rich text editor for content (use a library if needed)
3. Add auto-slug generation from title
4. Add publish status & date selector

**Estimated Time:** 20 minutes

---

## 🔄 Copy-Paste Template

Use this template for all remaining pages:

```typescript
import { useState, useEffect } from 'react';
import { useAuthUser } from '@/hooks/useDatabase';
import { [SERVICE]Service } from '@/integrations/supabase/services';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface [Entity] {
  id: string;
  user_id: string;
  // ... other fields
}

export default function Admin[Entity]DB() {
  const { user } = useAuthUser();
  const [data, setData] = useState<[Entity][]>([]);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(true);
  const [formData, setFormData] = useState({
    // ... form fields
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load data
  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  // Subscribe to changes
  useEffect(() => {
    if (!user) return;
    const subscription = supabase
      .from('[TABLE_NAME]')
      .on('*', () => {
        setSynced(false);
        loadData();
      })
      .subscribe();
    return () => subscription.unsubscribe();
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await [SERVICE]Service.getAll(user!.id);
      setData(result || []);
      setSynced(true);
    } catch (error) {
      toast.error('Failed to load data');
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
        await [SERVICE]Service.update(editingId, formData);
        toast.success('Updated!');
      } else {
        const newItem = await [SERVICE]Service.create(user.id, formData);
        setData([...data, newItem]);
        toast.success('Created!');
      }
      // Reset form
      setFormData({ /* ... */ });
      setEditingId(null);
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await [SERVICE]Service.delete(id);
      setData(data.filter(item => item.id !== id));
      toast.success('Deleted!');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (!user) {
    return <div>Please log in</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">[Title]</h1>
      
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit' : 'Add New'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Form fields */}
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* List */}
      <div className="space-y-4">
        {data.map(item => (
          <Card key={item.id}>
            <CardContent className="pt-6">
              {/* Item display */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

---

## 🚀 Implementation Order (Recommended)

**Priority 1 (Complete Today):**
1. AdminHobbiesDB.tsx - 5 minutes (simplest)
2. AdminEducationDB.tsx - 15 minutes
3. AdminAwardsDB.tsx - 10 minutes

**Priority 2 (Complete Tomorrow):**
4. AdminReferencesDB.tsx - 15 minutes
5. AdminCertificationsDB.tsx - 15 minutes

**Priority 3 (Nice to Have):**
6. AdminBlogPostsDB.tsx - 20 minutes

**Total Time:** ~90 minutes for complete admin panel

---

## 🔗 Update Routes

After creating each new component, update your routes in App.tsx:

```typescript
<Route path="/admin" element={<AdminLayout />}>
  <Route path="skills" element={<AdminSkillsDB />} />
  <Route path="experience" element={<AdminExperienceDB />} />
  <Route path="projects" element={<AdminProjectsDB />} />
  <Route path="education" element={<AdminEducationDB />} />
  <Route path="certifications" element={<AdminCertificationsDB />} />
  <Route path="awards" element={<AdminAwardsDB />} />
  <Route path="hobbies" element={<AdminHobbiesDB />} />
  <Route path="references" element={<AdminReferencesDB />} />
  <Route path="blog" element={<AdminBlogPostsDB />} />
</Route>
```

---

## ✅ Testing Checklist

For each new page:
- [ ] Add new item via form
- [ ] Verify appears in list
- [ ] Edit item and verify update
- [ ] Delete item and verify removal
- [ ] Open in second browser tab - verify real-time sync
- [ ] Refresh page - verify data persists in Supabase

---

## 📚 Field Reference Map

| Component | Table | Key Fields |
|-----------|-------|-----------|
| AdminSkillsDB | skills | skill_name, proficiency, category, featured |
| AdminExperienceDB | experience | company_name, position, start_date, end_date, is_current |
| AdminProjectsDB | projects | project_name, description, technologies, project_url, github_url, featured |
| AdminEducationDB | education | institution, degree_type, field_of_study, graduation_date, gpa |
| AdminCertificationsDB | certifications | certification_name, issuing_organization, issue_date, expiration_date, credential_url |
| AdminAwardsDB | awards | award_name, issuing_organization, award_date, description, featured |
| AdminHobbiesDB | hobbies | hobby_name, description, featured |
| AdminReferencesDB | references | reference_name, position, company, email, phone, relationship |
| AdminBlogPostsDB | blog_posts | title, slug, content, excerpt, published, featured, published_at |

---

## 💡 Pro Tips

1. **Auto-generate Slugs for Blog Posts:**
```typescript
const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
```

2. **Format Dates in Display:**
```typescript
{new Date(item.date).toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
})}
```

3. **Validate URLs:**
```typescript
const isValidUrl = (string: string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};
```

4. **Handle Array Fields (like technologies):**
```typescript
const [technologies, setTechnologies] = useState<string[]>([]);
const [techInput, setTechInput] = useState('');

const addTech = () => {
  if (techInput.trim()) {
    setTechnologies([...technologies, techInput.trim()]);
    setTechInput('');
  }
};

const removeTech = (index: number) => {
  setTechnologies(technologies.filter((_, i) => i !== index));
};
```

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "user_id must not be null" | Make sure user is loaded: `if (!user) return; ...` |
| Data not updating after mutation | Call `loadData()` after successful create/update/delete |
| Real-time not working | Check subscription is set up and not unsubscribed |
| Form not clearing | Make sure to reset formData: `setFormData({ ...initial })` |
| Duplicate items in list | Check you're not adding items twice, use unique keys |

---

**Ready to start? Pick AdminHobbiesDB first - it's the quickest win! 🎉**
