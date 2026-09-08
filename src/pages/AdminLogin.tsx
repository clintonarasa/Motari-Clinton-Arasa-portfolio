import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ArrowLeft, KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import localAuth from "@/integrations/localAuth";
import PageTransition from "@/components/portfolio/PageTransition";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"login" | "forgot" | "otp">("login");
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await localAuth.authenticate(email.trim(), password);
    setLoading(false);
    if (!ok) {
      toast({ title: "Login failed", description: "Invalid credentials.", variant: "destructive" });
      return;
    }
    localAuth.signIn(email.trim());
    toast({ title: "Logged in", description: "Welcome to the admin panel." });
    navigate("/admin/dashboard");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) return;
    setLoading(true);
    setLoading(false);
    toast({ title: "Email verification unavailable", description: "Use your configured local admin credentials." });
    setView("login");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetLoading(false);
    toast({ title: "Password reset unavailable", description: "Set VITE_LOCAL_ADMIN_EMAIL and VITE_LOCAL_ADMIN_PASSWORD in .env, then restart the app." });
    setView("login");
    setResetEmail("");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock size={24} className="text-primary" />
            </div>
            <h1 className="font-display text-3xl mb-2">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">
          {view === "login" && "Sign in to manage your portfolio content"}
          {view === "forgot" && "Reset your password"}
          {view === "otp" && "Enter the 6-digit code sent to your email"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {view === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="card-surface space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setView("forgot")}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </motion.form>
        ) : view === "forgot" ? (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleForgotPassword}
                className="card-surface space-y-4"
              >
                <p className="text-sm text-muted-foreground">
                  Enter the email address associated with your admin account and we'll send you a reset link.
                </p>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={resetLoading}>
                  {resetLoading ? "Sending..." : "Send Reset Link"}
                </Button>
                <button
                  type="button"
                  onClick={() => setView("login")}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto"
                >
                  <ArrowLeft size={12} /> Back to login
                </button>
              </motion.form>
        ) : (
          <motion.form
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleVerifyOtp}
            className="card-surface space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">6-Digit Code</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="pl-10 tracking-widest text-center text-lg font-mono"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Access"}
            </Button>
            <button
              type="button"
              onClick={() => { setView("login"); setOtp(""); }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mx-auto mt-4"
            >
              <ArrowLeft size={12} /> Cancel
            </button>
          </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default AdminLogin;
