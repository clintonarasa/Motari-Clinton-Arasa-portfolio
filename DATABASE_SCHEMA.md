# 📊 Database Schema Overview

## Complete Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          SUPABASE                           │
│                     PostgreSQL Database                     │
└─────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ AUTHENTICATION & USERS                                             │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  auth.users (Supplied by Supabase)                               │
│  └─ id, email, password_hash, metadata, ...                     │
│                                                                    │
│  public.users (Your custom user profiles)                        │
│  ├─ id (FK → auth.users)                                         │
│  ├─ email                                                         │
│  ├─ full_name                                                    │
│  ├─ avatar_url                                                   │
│  ├─ bio                                                          │
│  └─ created_at, updated_at                                       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ PORTFOLIO CONTENT TABLES                                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─ SKILLS                    ┌─ EXPERIENCE               │
│  │ • id                        │ • id                       │
│  │ • user_id                   │ • user_id                  │
│  │ • category (technical|soft) │ • title                    │
│  │ • skill_name                │ • company                  │
│  │ • proficiency (0-100)       │ • location                 │
│  │ • is_featured               │ • start_date               │
│  │ • created_at, updated_at    │ • end_date                 │
│  └─                            │ • current_role             │
│                                 │ • description              │
│  ┌─ PROJECTS                   │ • responsibilities[]       │
│  │ • id                         │ • achievements[]           │
│  │ • user_id                    │ • created_at, updated_at   │
│  │ • name                        └─                         │
│  │ • description                                            │
│  │ • long_description           ┌─ EDUCATION              │
│  │ • technologies[]              │ • id                     │
│  │ • github_link                 │ • user_id                │
│  │ • live_link                   │ • institution            │
│  │ • image_url                   │ • field_of_study         │
│  │ • featured                    │ • degree_level           │
│  │ • display_order               │ • start_date             │
│  │ • created_at, updated_at      │ • end_date               │
│  └─                              │ • grade                  │
│                                  │ • description            │
│  ┌─ CERTIFICATIONS             │ • logo_url               │
│  │ • id                          │ • created_at, updated_at │
│  │ • user_id                     └─                        │
│  │ • name                                                  │
│  │ • issuer                      ┌─ AWARDS                │
│  │ • issued_date                 │ • id                    │
│  │ • expires_at                  │ • user_id               │
│  │ • credential_url              │ • title                 │
│  │ • badge_url                   │ • issuer                │
│  │ • created_at, updated_at      │ • awarded_date          │
│  └─                              │ • description           │
│                                  │ • created_at, updated_at│
│  ┌─ HOBBIES                     └─                       │
│  │ • id                                                   │
│  │ • user_id                     ┌─ REFERENCES           │
│  │ • name                         │ • id                   │
│  │ • description                  │ • user_id              │
│  │ • icon                         │ • name                 │
│  │ • url                          │ • title                │
│  │ • created_at, updated_at       │ • company              │
│  └─                               │ • email                │
│                                   │ • phone                │
│                                   │ • relationship         │
│                                   │ • created_at, updated_at│
│                                   └─                      │
│                                                           │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ CONTENT & ENGAGEMENT                                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─ BLOG_POSTS                   ┌─ NEWSLETTER_SUBSCRIBERS │
│  │ • id                            │ • id                    │
│  │ • user_id                       │ • email (UNIQUE)        │
│  │ • title                         │ • subscribed_at         │
│  │ • slug (UNIQUE)                 └─                      │
│  │ • content                                                │
│  │ • excerpt                                               │
│  │ • featured_image                                        │
│  │ • tags[]                                                │
│  │ • published                                             │
│  │ • published_at                                          │
│  │ • created_at, updated_at                               │
│  └─                                                         │
│                                                             │
└────────────────────────────────────────────────────────────────────┘
```

## Relationships

```
auth.users (Supabase Auth)
    ↓
    └─→ users (Profile)
        ├─→ skills
        ├─→ experience
        ├─→ projects
        ├─→ education
        ├─→ certifications
        ├─→ awards
        ├─→ hobbies
        ├─→ references
        └─→ blog_posts

newsletter_subscribers (Public signup)
```

## Data Access Patterns

### Public Read (Everyone)
```
✅ Skills
✅ Experience
✅ Projects
✅ Education
✅ Certifications
✅ Awards
✅ Hobbies
✅ Published Blog Posts
✅ User Profiles
```

### Authenticated Only
```
🔒 References (own only)
🔒 Draft Blog Posts (own only)
```

### Write Access
```
✏️  Only authenticated users can write
✏️  Users can only modify their own data
✏️  Anyone can subscribe to newsletter
```

## Performance Optimizations

### Indexes
```sql
idx_skills_user_id
idx_experience_user_id
idx_projects_user_id
idx_projects_featured              -- For featured queries
idx_education_user_id
idx_certifications_user_id
idx_awards_user_id
idx_hobbies_user_id
idx_references_user_id
idx_blog_posts_user_id
idx_blog_posts_slug                -- For slug lookups
idx_blog_posts_published           -- For published filter
```

### Timestamps
- All tables have `created_at` and `updated_at`
- Automatically managed (defaults to now())
- Use for sorting and filtering

## Array Fields

```typescript
// These fields store arrays of values:
experience.responsibilities: string[]
experience.achievements: string[]
projects.technologies: string[]
blog_posts.tags: string[]
```

### Usage Example:
```typescript
// Create with array
await insert({
  technologies: ['React', 'TypeScript', 'Tailwind CSS'],
  responsibilities: ['Built API', 'Led team']
});

// Query with array operations
const { data } = await supabase
  .from('projects')
  .select('*')
  .contains('technologies', ['React']);
```

## Security Features

### Row Level Security (RLS)
```
✅ Enabled on all tables
✅ Users can only see/modify their own data
✅ Public can read published content
✅ Newsletter is write-only
```

### Data Validation
```
✅ UNIQUE constraints
✅ NOT NULL constraints
✅ CHECK constraints (e.g., proficiency 0-100)
✅ Foreign key constraints
```

## Useful Queries

### Get User's Profile Full Data
```sql
SELECT u.*, 
       array_agg(s.skill_name) as skills,
       array_agg(p.name) as projects
FROM users u
LEFT JOIN skills s ON u.id = s.user_id
LEFT JOIN projects p ON u.id = p.user_id AND p.featured = true
WHERE u.id = 'user-id'
GROUP BY u.id;
```

### Get Featured Projects with Technologies
```sql
SELECT name, description, technologies, github_link
FROM projects
WHERE featured = true
ORDER BY display_order ASC;
```

### Get Recent Blog Posts
```sql
SELECT title, slug, excerpt, published_at
FROM blog_posts
WHERE published = true
ORDER BY published_at DESC
LIMIT 10;
```

### Get User's Complete Portfolio
```sql
SELECT 
  (SELECT count(*) FROM skills WHERE user_id = $1) as skills_count,
  (SELECT count(*) FROM projects WHERE user_id = $1) as projects_count,
  (SELECT count(*) FROM experience WHERE user_id = $1) as experience_count,
  (SELECT count(*) FROM blog_posts WHERE user_id = $1 AND published = true) as blog_posts_count;
```

## Scalability

This schema supports:
- ✅ Multiple user profiles
- ✅ Unlimited portfolio items
- ✅ Real-time updates
- ✅ Full-text search (with Postgres)
- ✅ Analytics queries
- ✅ Backup & restore
- ✅ Horizontal scaling

## TypeScript Integration

```typescript
// Import types automatically generated from schema
import type { Database } from '@/integrations/supabase/types';
import type { Tables } from '@/integrations/supabase/types';

// Type-safe queries
type Skill = Tables<'skills'>['Row'];
type NewSkill = Tables<'skills'>['Insert'];

// Use in components
const skill: Skill = { id: '...', skill_name: 'React', ... };
```

## Next Steps

1. ✅ **Apply migrations** to create tables
2. ✅ **Verify schema** in Supabase dashboard
3. ✅ **Test RLS policies** with different users
4. ✅ **Connect services** to admin pages
5. ✅ **Enable real-time** for live updates
6. ✅ **Set up backups** for data protection
7. ✅ **Monitor performance** as data grows

---

**Schema Version**: 1.0  
**Created**: April 6, 2026  
**Database**: PostgreSQL (Supabase)
