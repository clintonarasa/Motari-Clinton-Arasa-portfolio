# 🚀 Quick Start: Connect Your Admin Panel to Database

This guide shows how to connect each admin page to your Supabase database in 5 minutes.

## Option 1: Use Pre-Built Service Functions (Easiest)

### Example: AdminSkills.tsx

```typescript
import { skillsService } from '@/integrations/supabase/services';
import { useAuthUser } from '@/hooks/useDatabase';

export default function AdminSkills() {
  const { user } = useAuthUser();
  const [skills, setSkills] = useState([]);

  // Load skills
  useEffect(() => {
    if (!user) return;
    skillsService.getAll(user.id).then(setSkills);
  }, [user]);

  // Add skill
  const handleAdd = async (skillData) => {
    const newSkill = await skillsService.create(user.id, skillData);
    setSkills([...skills, newSkill]);
  };

  // Update skill
  const handleUpdate = async (id, updates) => {
    await skillsService.update(id, updates);
    setSkills(skills.map(s => s.id === id ? {...s, ...updates} : s));
  };

  // Delete skill
  const handleDelete = async (id) => {
    await skillsService.delete(id);
    setSkills(skills.filter(s => s.id !== id));
  };

  return (
    <div>
      {/* UI with skills */}
    </div>
  );
}
```

---

## Option 2: Use React Hooks (Recommended)

### Fetching Data

```typescript
import { useDatabase, useAuthUser } from '@/hooks/useDatabase';

export default function AdminProjects() {
  const { user } = useAuthUser();
  const { data: projects, loading, error } = useDatabase(
    'projects',
    { user_id: user?.id }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {projects?.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

### Mutations (Create, Update, Delete)

```typescript
import { useDatabaseMutation } from '@/hooks/useDatabase';

export default function AddProject() {
  const { insert, update, delete: deleteProject, loading } = useDatabaseMutation('projects');

  const handleAdd = async (formData) => {
    const newProject = await insert({
      ...formData,
      user_id: user.id
    });
    console.log('Created:', newProject);
  };

  const handleUpdate = async (id, updates) => {
    const updated = await update(id, updates);
    console.log('Updated:', updated);
  };

  const handleDelete = async (id) => {
    await deleteProject(id);
    console.log('Deleted');
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleAdd(new FormData(e.target));
    }}>
      {/* Form fields */}
      <button disabled={loading}>Save</button>
    </form>
  );
}
```

---

## Option 3: Direct Supabase Client

### Simple Queries

```typescript
import { supabase } from '@/integrations/supabase/client';

// Get skills
const { data: skills, error } = await supabase
  .from('skills')
  .select('*')
  .eq('user_id', userId);

// Insert
const { data: newSkill, error } = await supabase
  .from('skills')
  .insert([{ user_id: userId, skill_name: 'React' }])
  .select();

// Update
const { error } = await supabase
  .from('skills')
  .update({ proficiency: 95 })
  .eq('id', skillId);

// Delete
const { error } = await supabase
  .from('skills')
  .delete()
  .eq('id', skillId);
```

### Real-Time Subscriptions

```typescript
const subscription = supabase
  .from('skills')
  .on('*', payload => {
    console.log('Change received!', payload);
    // payload.eventType: INSERT, UPDATE, DELETE
    // payload.new: new data
    // payload.old: old data
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## 📋 Implementation Checklist

### Step 1: Set Up Authentication
- [ ] Create login page with Supabase auth
- [ ] Use `useAuthUser()` to get current user
- [ ] Redirect to login if not authenticated
- [ ] Add logout button

**Example:**
```typescript
import { supabase } from '@/integrations/supabase/client';

const handleLogin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  });
  if (error) throw error;
};

const handleLogout = async () => {
  await supabase.auth.signOut();
};
```

### Step 2: Update Each Admin Page

For each page, follow this pattern:

```typescript
import { useAuthUser } from '@/hooks/useDatabase';
import { [tableName]Service } from '@/integrations/supabase/services';

export default function Admin[Feature]() {
  const { user } = useAuthUser();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    [tableName]Service.getAll(user.id)
      .then(setData)
      .finally(() => setLoading(false));
  }, [user]);

  // Add
  const handleAdd = async (newItem) => {
    const created = await [tableName]Service.create(user.id, newItem);
    setData([...data, created]);
  };

  // Update
  const handleUpdate = async (id, updates) => {
    await [tableName]Service.update(id, updates);
    setData(data.map(item => item.id === id ? {...item, ...updates} : item));
  };

  // Delete
  const handleDelete = async (id) => {
    await [tableName]Service.delete(id);
    setData(data.filter(item => item.id !== id));
  };

  if (!user) return <div>Please log in</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

### Step 3: Replace Placeholder Components

- [ ] AdminSkills → Connect to `skillsService`
- [ ] AdminExperience → Connect to `experienceService`
- [ ] AdminProjects → Connect to `projectsService`
- [ ] AdminEducation → Connect to `educationService`
- [ ] AdminAwards → Connect to `awardsService`
- [ ] AdminHobbies → Connect to `hobbiesService`
- [ ] AdminReferences → Connect to `referencesService`

### Step 4: Add Real-Time Features

```typescript
useEffect(() => {
  if (!user) return;

  const subscription = supabase
    .from('skills')
    .on('*', () => {
      // Refresh data when changes occur
      skillsService.getAll(user.id).then(setSkills);
    })
    .subscribe();

  return () => subscription.unsubscribe();
}, [user]);
```

### Step 5: Test & Deploy
- [ ] Test CRUD operations
- [ ] Verify real-time sync
- [ ] Check error handling
- [ ] Test authentication
- [ ] Deploy to production

---

## 📚 Available Services

### Services Available
```typescript
// Each service has: getAll(), create(), update(), delete()
import {
  skillsService,
  experienceService,
  projectsService,
  educationService,
  certificationsService,
  awardsService,
  hobbiesService,
  referencesService,
  blogService,
  userService,
  newsletterService
} from '@/integrations/supabase/services';
```

### Usage Pattern
```typescript
// Get all items for user
await .getAll(userId);

// Create new item
await .create(userId, { ...itemData });

// Update existing item
await .update(itemId, { ...updates });

// Delete item
await .delete(itemId);
```

---

## 🔐 Authentication Implementation

### Protect Admin Routes

```typescript
// src/contexts/ProtectedRoute.tsx
import { useAuthUser } from '@/hooks/useDatabase';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuthUser();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/admin/login" />;

  return children;
}
```

```typescript
// Update your routes
<Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
  <Route path="skills" element={<AdminSkills />} />
  {/* Other routes */}
</Route>
```

### Admin Login Page

```typescript
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email, password
      });
      if (error) setError(error.message);
      else window.location.href = '/admin/dashboard';
    } catch (err) {
      setError('Login failed');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <div className="text-red-500">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## ✅ Verification Checklist

- [ ] Migrations applied to Supabase
- [ ] All 11 tables exist in Supabase
- [ ] `.env` has correct credentials
- [ ] `testSupabaseInBrowser()` passes
- [ ] Can fetch data from Supabase
- [ ] Can insert data into Supabase
- [ ] Can update data in Supabase
- [ ] Can delete data from Supabase
- [ ] Real-time subscriptions work
- [ ] Authentication works
- [ ] Admin pages use database
- [ ] Portfolio displays database data

---

## 🐛 Common Issues & Solutions

### "user_id must be provided"
✅ Solution: Make sure user is loaded with `useAuthUser()` before making queries

### "RLS policy violation"
✅ Solution: Check that authenticated user is making the request, not anonymous

### "Cannot read properties of null"
✅ Solution: Add loading state and check if user exists before querying

### "Data not syncing in real-time"
✅ Solution: Ensure subscription is set up and not unsubscribed prematurely

### "Type errors in services"
✅ Solution: Run type generation: `supabase gen types typescript --schema public`

---

## 🎯 Next Steps

1. ✅ **Apply migrations** (Run `supabase db push`)
2. ✅ **Test connection** (Open console, run `testSupabaseInBrowser()`)
3. ✅ **Set up auth** (Implement login page)
4. ✅ **Update admin pages** (Follow patterns above)
5. ✅ **Add real-time** (Enable subscriptions)
6. ✅ **Deploy** (Test in production)

---

## 💡 Pro Tips

1. **Use Real-Time for Live Updates**
```typescript
supabase
  .from('skills')
  .on('*', () => loadSkills())
  .subscribe();
```

2. **Paginate Large Datasets**
```typescript
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .range(0, 9); // Get first 10
```

3. **Search & Filter**
```typescript
const { data } = await supabase
  .from('blog_posts')
  .select('*')
  .ilike('title', `%${query}%`);
```

4. **Sort Results**
```typescript
const { data } = await supabase
  .from('projects')
  .select('*')
  .order('created_at', { ascending: false });
```

---

**Ready? Start with Step 1 in the Next Steps section!**
