import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { SiteSettingsProvider, useSiteSettings } from "@/contexts/SiteSettingsContext";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { TerminalEasterEgg } from "@/components/portfolio/TerminalEasterEgg";
import { PageTransition } from "@/components/ui/PageTransition";
import { Loader2 } from "lucide-react";
import Index from "./pages/Index";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import SEO from "@/components/SEO";

// Lazy load non-critical routes to drastically reduce initial bundle size
const Resume = React.lazy(() => import("./pages/Resume"));
const ProjectDetails = React.lazy(() => import("./pages/ProjectDetails"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const AdminLogin = React.lazy(() => import("./pages/AdminLogin"));
const AdminLayout = React.lazy(() => import("./pages/AdminLayout"));
const AdminOverview = React.lazy(() => import("./pages/admin/AdminOverview"));
const AdminProfile = React.lazy(() => import("./pages/admin/AdminProfile"));
const AdminSummary = React.lazy(() => import("./pages/admin/AdminSummary"));
const AdminSkillsDB = React.lazy(() => import("./pages/admin/AdminSkillsDB"));
const AdminExperienceDB = React.lazy(() => import("./pages/admin/AdminExperienceDB"));
const AdminProjectsDB = React.lazy(() => import("./pages/admin/AdminProjectsDB"));
const AdminEducation = React.lazy(() => import("./pages/admin/AdminEducation"));
const AdminAwards = React.lazy(() => import("./pages/admin/AdminAwards"));
const AdminHobbies = React.lazy(() => import("./pages/admin/AdminHobbies"));
const AdminReferences = React.lazy(() => import("./pages/admin/AdminReferences"));
const AdminBlogPostsDB = React.lazy(() => import("./pages/admin/AdminBlogPostsDB"));
const AdminSettings = React.lazy(() => import("./pages/admin/AdminSettings"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Index /></PageTransition>} />
          <Route path="/resume" element={<PageTransition><Resume /></PageTransition>} />
          <Route path="/projects/:id" element={<PageTransition><ProjectDetails /></PageTransition>} />
          <Route path="/blog/:slug" element={<PageTransition><BlogPost /></PageTransition>} />
          <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
          <Route path="/admin/login" element={<PageTransition><AdminLogin /></PageTransition>} />
          <Route path="/admin" element={<ProtectedRoute><PageTransition><AdminLayout /></PageTransition></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PageTransition><AdminOverview /></PageTransition>} />
            <Route path="profile" element={<PageTransition><AdminProfile /></PageTransition>} />
            <Route path="summary" element={<PageTransition><AdminSummary /></PageTransition>} />
            <Route path="skills" element={<PageTransition><AdminSkillsDB /></PageTransition>} />
            <Route path="experience" element={<PageTransition><AdminExperienceDB /></PageTransition>} />
            <Route path="projects" element={<PageTransition><AdminProjectsDB /></PageTransition>} />
            <Route path="education" element={<PageTransition><AdminEducation /></PageTransition>} />
            <Route path="awards" element={<PageTransition><AdminAwards /></PageTransition>} />
            <Route path="hobbies" element={<PageTransition><AdminHobbies /></PageTransition>} />
            <Route path="references" element={<PageTransition><AdminReferences /></PageTransition>} />
            <Route path="blog" element={<PageTransition><AdminBlogPostsDB /></PageTransition>} />
            <Route path="settings" element={<PageTransition><AdminSettings /></PageTransition>} />
          </Route>
          <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <SiteSettingsProvider>
        <AppContent />
      </SiteSettingsProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

const AppContent = () => {
  const { settingsReady } = useSiteSettings();
  if (!settingsReady) return <PageLoader />;
  return (
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SEO />
            <CommandPalette />
            <TerminalEasterEgg />
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
  );
};

export default App;