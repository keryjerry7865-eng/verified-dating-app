import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Heart, LockKeyhole, Mail } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import Dashboard from "./components/Dashboard";
import ProfileSetup from "./components/ProfileSetup";
import NotFound from "./pages/NotFound";
import { supabase, supabaseConfigError } from "./supabaseClient";

const queryClient = new QueryClient();

const formatError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || "Unknown authentication error");
  return message.toLowerCase().includes("failed to fetch") || message.toLowerCase().includes("network")
    ? "Network error. Check your connection and Supabase project status."
    : message;
};

const getDisplayName = (session: Session) => {
  const metadata = session.user.user_metadata;
  return metadata?.display_name || metadata?.name || metadata?.full_name || session.user.email?.split('@')[0] || 'LoveMatch member';
};

const AuthScreen = () => {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    if (supabaseConfigError) {
      setMessage(supabaseConfigError);
      setLoading(false);
      return;
    }

    try {
      const result = mode === "sign-in"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (result.error) throw result.error;
      if (mode === "sign-up" && !result.data.session) {
        setMessage("Account created. Check your email, then sign in.");
        setMode("sign-in");
      }
    } catch (error) {
      setMessage(formatError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-50 via-white to-orange-50 px-4 py-8">
      <section className="w-full max-w-md rounded-[2rem] border border-white bg-white/90 p-8 text-center shadow-2xl shadow-rose-100 backdrop-blur">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200"><Heart className="h-8 w-8 fill-current" /></div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-rose-500">LoveMatch</p>
        <h1 className="mt-2 text-3xl font-black text-gray-900">{mode === "sign-in" ? "Welcome back" : "Start something real"}</h1>
        <p className="mt-2 text-sm text-gray-500">{mode === "sign-in" ? "Sign in to continue to your matches." : "Create your private dating profile."}</p>
        <form onSubmit={submit} className="mt-8 space-y-3 text-left">
          <label className="relative block"><Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" autoComplete="email" className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" /></label>
          <label className="relative block"><LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" /><input required minLength={6} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100" /></label>
          <button disabled={loading} className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white transition hover:bg-rose-600 disabled:opacity-60">{loading ? "Please wait..." : mode === "sign-in" ? "Sign in" : "Create account"}</button>
        </form>
        {message && <p className="mt-4 text-sm text-rose-600">{message}</p>}
        <button type="button" onClick={() => { setMode((current) => current === "sign-in" ? "sign-up" : "sign-in"); setMessage(""); }} className="mt-5 text-xs font-bold text-rose-600">{mode === "sign-in" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
      </section>
    </main>
  );
};

const AuthenticatedApp = ({ session }: { session: Session }) => {
  const [profile, setProfile] = useState<{ age: number; gender: string; city: string; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    const { data, error: profileError } = await supabase.from("profiles").select("age,gender,city,avatar_url").eq("id", session.user.id).maybeSingle();
    if (profileError) setError(profileError.message);
    setProfile(data);
    setLoading(false);
  };

  useEffect(() => { void loadProfile(); }, [session.user.id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-rose-50 text-sm font-bold text-gray-600">Loading your profile...</div>;
  if (error) return <div className="flex min-h-screen items-center justify-center p-6 text-center text-sm text-rose-600">{error}</div>;

  const complete = Boolean(profile?.age >= 18 && profile.gender && profile.city && profile.avatar_url);
  return complete
    ? <Dashboard session={session} onSignOut={() => void supabase.auth.signOut()} />
    : <ProfileSetup session={session} onComplete={() => void loadProfile()} />;
};

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const completeAuth = async () => {
      try {
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error(error);
        }
      } catch (error) {
        console.error("Auth callback failed:", error);
      } finally {
        navigate("/", { replace: true });
      }
    };

    completeAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-red-100">
      <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-lg">
        <p className="text-lg font-bold text-gray-800">Finishing sign-in...</p>
        <p className="mt-2 text-sm text-gray-500">Restoring your session...</p>
      </div>
    </div>
  );
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (mounted) { setSession(data.session); setLoading(false); }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-rose-50 text-sm font-bold text-gray-600">Checking secure session...</div>;

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={session ? <AuthenticatedApp session={session} /> : <AuthScreen />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/profile-setup" element={session ? <AuthenticatedApp session={session} /> : <AuthScreen />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
