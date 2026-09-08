# 🚀 Supabase Database Setup Guide

## Overview
Your portfolio now has a complete database schema with authentication, real-time capabilities, and row-level security (RLS) policies.

---

## 📋 Database Schema Created

### Tables Included:
1. **users** - User profiles and authentication
2. **skills** - Technical and soft skills
3. **experience** - Work experience history
4. **projects** - Portfolio projects
5. **education** - Educational background
6. **certifications** - Professional certifications
7. **awards** - Awards and recognition
8. **hobbies** - Personal interests
9. **references** - Professional references
10. **blog_posts** - Blog articles
11. **newsletter_subscribers** - Newsletter signups

### Features:
- ✅ Row Level Security (RLS) enabled
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Indexes for performance
- ✅ Foreign key relationships
- ✅ Default values
- ✅ Data validation

---

## 🔧 Setup Instructions

### Step 1: Apply Database Migrations

Your new migration file is ready at:
```
supabase/migrations/20260406_create_portfolio_schema.sql
```

**Option A: Using Supabase CLI (Recommended)**

**IMPORTANT: Do NOT use `npm install -g supabase`** - it has compatibility issues on Windows.

**Use `npx` instead (simpler, no global installation needed):**

```bash
# Login to Supabase (opens browser for authentication)
npx supabase@latest login

# Link to your project
npx supabase@latest link --project-ref qacghdielhdpuyxlzgbk

# Push migrations to create tables
npx supabase@latest db push
```

**Note:** First time setup may take 1-2 minutes as npx downloads the package. Subsequent commands run much faster.

**Option B: Manual SQL in Dashboard**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy the entire migration file content
6. Run the query

### Step 2: Verify Tables Were Created

In Supabase Dashboard:
1. Go to **Table Editor**
2. You should see all 11 tables listed
3. Click on each to verify columns are created correctly

### Step 3: Test the Connection

Open your browser console (F12) and run:

```javascript
// Copy this into your browser console
import { testSupabaseInBrowser } from '@/integrations/supabase/diagnostics';
await testSupabaseInBrowser();
```

---

## 💾 Using the Database in Components

### Option 1: Using Service Functions

```typescript
import { skillsService, projectsService } from '@/integrations/supabase/services';

// In your component
const userId = user.id;

// Get skills
const skills = await skillsService.getAll(userId);

// Create skill
const newSkill = await skillsService.create(userId, {
  category: 'technical',
  skill_name: 'React',
  proficiency: 90,
  is_featured: true
});

// Update skill
await skillsService.update(skillId, { proficiency: 95 });

// Delete skill
await skillsService.delete(skillId);
```

### Option 2: Using Custom Hooks (Recommended for React)

```typescript
import { useDatabase, useDatabaseMutation } from '@/hooks/useDatabase';

export function SkillsPage() {
  const userId = 'current-user-id';
  
  // Fetch data
  const { data: skills, loading, error } = useDatabase('skills', {
    user_id: userId
  });

  // Mutations
  const { insert, update, delete: deleteSkill, loading: mutating } = useDatabaseMutation('skills');

  const handleAddSkill = async (skillData: any) => {
    await insert({ ...skillData, user_id: userId });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {skills?.map(skill => (
        <div key={skill.id}>
          {skill.skill_name}
          <button onClick={() => deleteSkill(skill.id)}>Delete</button>
        </div>
      ))}
      <button onClick={() => handleAddSkill({...})}>Add Skill</button>
    </div>
  );
}
```

### Option 3: Direct Supabase Client

```typescript
import { supabase } from '@/integrations/supabase/client';

// Direct query
const { data, error } = await supabase
  .from('skills')
  .select('*')
  .eq('user_id', userId);

// With real-time subscription
const subscription = supabase
  .from('skills')
  .on('*', payload => {
    console.log('Data changed:', payload);
  })
  .subscribe();

// Cleanup
subscription.unsubscribe();
```

---

## 🔐 Authentication Setup

### Implement Supabase Auth in Admin Panel

```typescript
import { supabase } from '@/integrations/supabase/client';

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

// Logout
await supabase.auth.signOut();

// Get current user
const { data: { user } } = await supabase.auth.getUser();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth event:', event);
  console.log('User:', session?.user);
});
```

---

## 📁 File Locations

```
src/
├── integrations/
│   └── supabase/
│       ├── client.ts           # Supabase client
│       ├── services.ts         # Database service functions ✨ NEW
│       ├── diagnostics.ts      # Connection testing ✨ NEW
│       └── types.ts            # TypeScript types
├── hooks/
│   └── useDatabase.ts          # Custom React hooks ✨ NEW
│
supabase/
├── config.toml                 # Supabase config
└── migrations/
    ├── 20260308...sql          # Original migration
    └── 20260406...sql          # New portfolio schema ✨ NEW
```

---

## 🚦 Row Level Security (RLS) Policies

All tables have RLS enabled with these policies:

### Public (Everyone can read):
- ✅ skills
- ✅ experience
- ✅ projects
- ✅ education
- ✅ certifications
- ✅ awards
- ✅ hobbies
- ✅ published blog posts

### Authenticated Only (Users manage their own):
- 🔒 references
- 🔒 draft blog posts

### Special Cases:
- **newsletter_subscribers**: Anyone can subscribe, no one can read
- **users**: Can read all profiles, update own profile

---

## 🐛 Troubleshooting

### Migration Failed
**Error**: "Table already exists"
- **Solution**: The tables already exist. Tables are idempotent with `IF NOT EXISTS`

### Permission Denied
**Error**: "new row violates row-level security policy"
- **Solution**: Ensure you're authenticated and user_id matches current user

### Can't Connect
**Error**: "Failed to connect to database"
- **Solution**: 
  1. Check `.env` file has correct credentials
  2. Verify Supabase project is active
  3. Check your internet connection

### Data Not Showing
**Problem**: Queries return empty
- **Solution**:
  1. Verify RLS policies allow the operation
  2. Check that data actually exists
  3. Verify user_id matches

---

## 📊 Useful SQL Queries

### Check all tables
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

### Check RLS policies
```sql
SELECT * FROM pg_policies;
```

### View table structure
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'skills';
```

### Count records
```sql
SELECT COUNT(*) FROM skills;
```

---

## 🎯 Next Steps

1. ✅ **Apply migrations** (Step 1 above)
2. ✅ **Test connection** (Step 3 above)
3. 📝 **Connect admin panel** - Use the services in your admin pages
4. 🔐 **Implement auth** - Add login/signup to admin panel
5. 🎨 **Build CRUD interfaces** - Create forms for managing data
6. 🚀 **Deploy to production** - Ensure RLS is properly configured

---

## 💡 Example: Connecting Skills Admin Page

```typescript
// src/pages/admin/AdminSkills.tsx
import { useAuthUser } from '@/hooks/useDatabase';
import { useDatabaseMutation } from '@/hooks/useDatabase';
import { skillsService } from '@/integrations/supabase/services';

export default function AdminSkills() {
  const { user } = useAuthUser();
  const [skills, setSkills] = useState([]);
  const { insert, update, delete: deleteSkill } = useDatabaseMutation('skills');

  useEffect(() => {
    if (user) {
      skillsService.getAll(user.id).then(setSkills);
    }
  }, [user]);

  const handleAddSkill = async (newSkill: any) => {
    if (!user) return;
    const created = await insert({ ...newSkill, user_id: user.id });
    setSkills([...skills, created]);
  };

  return (
    <div>
      <h1>Manage Skills</h1>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        // Get form data and call handleAddSkill
      }}>
        <input name="skill_name" placeholder="Skill name" required />
        <input name="proficiency" type="number" min="0" max="100" />
        <select name="category">
          <option value="technical">Technical</option>
          <option value="soft">Soft</option>
        </select>
        <button type="submit">Add Skill</button>
      </form>

      <div>
        {skills.map(skill => (
          <div key={skill.id}>
            <span>{skill.skill_name}</span>
            <button onClick={() => deleteSkill(skill.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✨ Features Ready to Use

- 🔐 Authentication (signup, login, logout, session management)
- 📊 Database queries with real-time subscriptions
- 🛡️ Row-level security for data privacy
- 🚀 Automatic timestamps and soft deletes
- 💾 Transaction support
- 🔄 Real-time synchronization
- 📈 Performance optimized with indexes

---

**Questions?** Check Supabase docs: https://supabase.com/docs

