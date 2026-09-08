# 🎨 Portfolio Pages Database Integration

This guide shows how to update your public portfolio pages to display data from the database instead of hardcoded portfolio-data.

## Current Architecture

Your portfolio pages currently use hardcoded data from `src/data/portfolio-data.ts`. Here's how to switch to database:

```typescript
// Current (Static)
import { portfolioData } from '@/data/portfolio-data';

export function SkillsSection() {
  return portfolioData.skills.map(skill => ...)
}

// New (Dynamic)
const [skills, setSkills] = useState([]);

useEffect(() => {
  skillsService.getAll(userId).then(setSkills);
}, [userId]);
```

---

## 🔄 Component Migration Pattern

### Before (Static Data)
```typescript
import { portfolioData } from '@/data/portfolio-data';

export function ProjectsSection() {
  return (
    <div className="projects">
      {portfolioData.projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

### After (Database)
```typescript
import { useState, useEffect } from 'react';
import { projectsService } from '@/integrations/supabase/services';
import { useAuthUser } from '@/hooks/useDatabase';

export function ProjectsSection() {
  const { user } = useAuthUser();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    projectsService.getAll(user.id)
      .then(setProjects)
      .catch(() => setProjects([]))  // Fall back to empty
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="text-center py-8">Loading projects...</div>;
  if (!projects?.length) return <div className="text-center py-8">No projects yet</div>;

  return (
    <div className="projects">
      {projects
        .filter(p => p.featured)  // Only show featured projects
        .map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
    </div>
  );
}
```

---

## 📋 Portfolio Pages to Update

### 1. SkillsSection.tsx

**Current:** Uses `portfolioData.skills`
**Database:** Uses `skillsService.getAll()`

```typescript
import { skillsService } from '@/integrations/supabase/services';
import { useAuthUser } from '@/hooks/useDatabase';

export function SkillsSection() {
  const { user } = useAuthUser();
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (!user) return;
    skillsService.getAll(user.id)
      .then(data => {
        // Group by category
        const grouped = data?.reduce((acc, skill) => {
          const cat = skill.category || 'Other';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(skill);
          return acc;
        }, {});
        setSkills(grouped || {});
      });
  }, [user]);

  return (
    <section id="skills" className="py-20">
      {Object.entries(skills).map(([category, categorySkills]) => (
        <div key={category}>
          <h3 className="text-xl font-bold">{category}</h3>
          <div className="grid grid-cols-3 gap-4">
            {categorySkills.map(skill => (
              <div key={skill.id} className="flex items-center gap-2">
                <span>{skill.skill_name}</span>
                <div className="w-full bg-gray-200 rounded h-2">
                  <div 
                    className="bg-blue-500 h-full rounded"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
```

---

### 2. ExperienceSection.tsx

**Current:** Uses `portfolioData.experience`
**Database:** Uses `experienceService.getAll()`

```typescript
import { experienceService } from '@/integrations/supabase/services';

export function ExperienceSection() {
  const { user } = useAuthUser();
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    if (!user) return;
    experienceService.getAll(user.id)
      .then(data => {
        // Sort by start date, newest first
        const sorted = data?.sort((a, b) => 
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
        );
        setExperiences(sorted || []);
      });
  }, [user]);

  return (
    <section id="experience" className="py-20">
      <h2 className="text-3xl font-bold mb-10">Experience</h2>
      <div className="space-y-6">
        {experiences.map(exp => (
          <div key={exp.id} className="border-l-4 border-blue-500 pl-6 py-2">
            <h3 className="text-xl font-semibold">{exp.position}</h3>
            <p className="text-gray-600">{exp.company_name}</p>
            <p className="text-sm text-gray-500">
              {new Date(exp.start_date).toLocaleDateString()} -
              {exp.is_current ? ' Present' : ` ${new Date(exp.end_date).toLocaleDateString()}`}
            </p>
            <p className="mt-2 text-gray-700">{exp.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

### 3. ProjectsSection.tsx

**Current:** Uses `portfolioData.projects`
**Database:** Uses `projectsService.getAll()`

```typescript
import { projectsService } from '@/integrations/supabase/services';

export function ProjectsSection() {
  const { user } = useAuthUser();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    if (!user) return;
    projectsService.getAll(user.id)
      .then(data => {
        // Filter featured, sort by creation date
        const sorted = data
          ?.filter(p => p.featured)
          .sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        setProjects(sorted || []);
      });
  }, [user]);

  return (
    <section id="projects" className="py-20">
      <h2 className="text-3xl font-bold mb-10">Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold">{project.project_name}</h3>
            <p className="text-gray-600 mt-2">{project.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {project.technologies.map(tech => (
                <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex gap-4 mt-4">
              {project.project_url && (
                <a href={project.project_url} target="_blank" className="text-blue-600">
                  View Live
                </a>
              )}
              {project.github_url && (
                <a href={project.github_url} target="_blank" className="text-blue-600">
                  GitHub
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

### 4. EducationSection.tsx

```typescript
import { educationService } from '@/integrations/supabase/services';

export function EducationSection() {
  const { user } = useAuthUser();
  const [educations, setEducations] = useState([]);

  useEffect(() => {
    if (!user) return;
    educationService.getAll(user.id)
      .then(data => {
        const sorted = data?.sort((a, b) => 
          new Date(b.graduation_date).getTime() - new Date(a.graduation_date).getTime()
        );
        setEducations(sorted || []);
      });
  }, [user]);

  return (
    <section id="education" className="py-20">
      <h2 className="text-3xl font-bold mb-10">Education</h2>
      <div className="space-y-6">
        {educations.map(edu => (
          <div key={edu.id} className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-xl font-semibold">{edu.degree_type} in {edu.field_of_study}</h3>
            <p className="text-gray-600">{edu.institution}</p>
            <p className="text-sm text-gray-500">
              Graduated: {new Date(edu.graduation_date).toLocaleDateString()}
            </p>
            {edu.gpa && <p className="text-sm">GPA: {edu.gpa.toFixed(2)}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

### 5. AwardsSection.tsx

```typescript
import { awardsService } from '@/integrations/supabase/services';

export function AwardsSection() {
  const { user } = useAuthUser();
  const [awards, setAwards] = useState([]);

  useEffect(() => {
    if (!user) return;
    awardsService.getAll(user.id)
      .then(data => {
        const featured = data?.filter(a => a.featured);
        setAwards(featured || []);
      });
  }, [user]);

  return (
    <section id="awards" className="py-20">
      <h2 className="text-3xl font-bold mb-10">Awards & Recognition</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {awards.map(award => (
          <div key={award.id} className="flex items-start gap-3">
            <span className="text-2xl">🏆</span>
            <div>
              <h4 className="font-semibold">{award.award_name}</h4>
              <p className="text-sm text-gray-600">{award.issuing_organization}</p>
              <p className="text-xs text-gray-500">
                {new Date(award.award_date).toLocaleDateString()}
              </p>
              <p className="text-sm mt-1">{award.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

### 6. HobbiesSection.tsx

```typescript
import { hobbiesService } from '@/integrations/supabase/services';

export function HobbiesSection() {
  const { user } = useAuthUser();
  const [hobbies, setHobbies] = useState([]);

  useEffect(() => {
    if (!user) return;
    hobbiesService.getAll(user.id)
      .then(data => {
        const featured = data?.filter(h => h.featured);
        setHobbies(featured || []);
      });
  }, [user]);

  return (
    <section id="hobbies" className="py-20">
      <h2 className="text-3xl font-bold mb-10">Interests & Hobbies</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {hobbies.map(hobby => (
          <div key={hobby.id} className="text-center">
            <p className="text-3xl mb-2">🎯</p>
            <h4 className="font-semibold">{hobby.hobby_name}</h4>
            <p className="text-sm text-gray-600 mt-1">{hobby.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

---

### 7. BlogSection.tsx

```typescript
import { blogService } from '@/integrations/supabase/services';

export function BlogSection() {
  const { user } = useAuthUser();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!user) return;
    blogService.getAll(user.id)
      .then(data => {
        const published = data
          ?.filter(p => p.published)
          .sort((a, b) => 
            new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
          );
        setPosts(published || []);
      });
  }, [user]);

  if (!posts.length) return null;

  return (
    <section id="blog" className="py-20">
      <h2 className="text-3xl font-bold mb-10">Latest Articles</h2>
      <div className="space-y-6">
        {posts.slice(0, 3).map(post => (  // Show latest 3
          <article key={post.id} className="border-b pb-6">
            <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            <p className="text-gray-600 mb-2">{post.excerpt}</p>
            <p className="text-xs text-gray-500">
              {new Date(post.published_at).toLocaleDateString()}
            </p>
            <a href={`/blog/${post.slug}`} className="text-blue-600 hover:underline mt-2">
              Read More →
            </a>
          </article>
        ))}
      </div>
      <a href="/blog" className="text-blue-600 font-semibold mt-6 inline-block">
        View All Articles →
      </a>
    </section>
  );
}
```

---

## ⚠️ Important Considerations

### 1. User Lookup
The portfolio needs to know which user's data to display. Options:

**Option A: Portfolio owner is fixed**
```typescript
const PORTFOLIO_USER_ID = 'your-user-id-here';

useEffect(() => {
  skillsService.getAll(PORTFOLIO_USER_ID).then(setSkills);
}, []);
```

**Option B: Portfolio owner in URL**
```typescript
const { userId } = useParams();

useEffect(() => {
  if (!userId) return;
  skillsService.getAll(userId).then(setSkills);
}, [userId]);
```

**Option C: Fetch from public profile**
```typescript
// Get profile from users table with portfolio slug
const profile = await userService.getBySlug('your-portfolio-slug');
// Then use profile.id to fetch their data
```

### 2. Fallback to Static Data
If database is down, fall back to `portfolio-data.ts`:

```typescript
useEffect(() => {
  if (!user) return;

  skillsService.getAll(user.id)
    .then(setSkills)
    .catch(error => {
      console.warn('Using fallback data:', error);
      setSkills(portfolioData.skills);  // Fallback
    });
}, [user]);
```

### 3. Performance Optimization
Load only featured items and limit results:

```typescript
// Load only featured items for portfolio display
const data = await supabase
  .from('skills')
  .select('*')
  .eq('user_id', userId)
  .eq('featured', true)  // Only featured
  .order('proficiency', { ascending: false })  // Sort by proficiency
  .limit(10);  // Show only top 10
```

### 4. Caching Strategy
Cache data to avoid repeated fetches:

```typescript
import { useQuery } from '@tanstack/react-query';

function usePortfolioSkills(userId) {
  return useQuery({
    queryKey: ['skills', userId],
    queryFn: () => skillsService.getAll(userId),
    staleTime: 60 * 1000,  // Cache for 1 minute
  });
}
```

---

## 🚀 Implementation Checklist

- [ ] Update SkillsSection to use database
- [ ] Update ExperienceSection to use database
- [ ] Update ProjectsSection to use database
- [ ] Update EducationSection to use database
- [ ] Update AwardsSection to use database
- [ ] Update HobbiesSection to use database
- [ ] Update BlogSection to use database
- [ ] Test each section loads data correctly
- [ ] Verify fallback works if user not found
- [ ] Performance test with large datasets

---

## 🔄 Testing Database-Connected Portfolio

1. **Verify Data Loads:**
   - Open portfolio page
   - Check browser console for errors
   - Verify data appears in sections

2. **Test in Admin Panel:**
   - Add new skill in admin
   - Refresh portfolio
   - Verify skill appears

3. **Real-time Sync (Optional):**
   - Open portfolio in two tabs
   - Add item in admin
   - Second tab updates automatically

---

**Optional: Add a "Edit" button visible only to logged-in owner:**

```typescript
const { user } = useAuthUser();
const isOwner = user?.id === portfolioOwnerId;

return (
  <div>
    {isOwner && (
      <a href="/admin/skills" className="float-right text-blue-600">
        Edit Skills →
      </a>
    )}
    {/* Section content */}
  </div>
);
```

---

**Next: Choose one section to migrate first, then follow the pattern for the rest!**
