import { useState, useEffect } from 'react';
import { Heart, X, MessageCircle, Video, Share2, Lock, CheckCircle, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Profile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  image: string;
  verified: boolean;
  interests: string[];
}

const subscriptionPlans = [
  { duration: "3 Days", price: 29, period: "₹29" },
  { duration: "1 Week", price: 49, period: "₹49" },
  { duration: "1 Month", price: 99, period: "₹99" }
];

export default function Index() {
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dbProfiles, setDbProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [matches, setMatches] = useState<number[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'moments' | 'live' | 'pricing'>('discover');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfiles();
        fetchUserStats();
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfiles();
        fetchUserStats();
      } else {
        setDbProfiles([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('profile').select('*');
      if (error) throw error;

      if (data) {
        const formatted: Profile[] = data.map((p: any) => ({
          id: p.id || Math.random().toString(),
          name: p.name || 'User',
          age: p.age || 22,
          location: p.city || 'India',
          bio: p.bio || 'Hello there!',
          image: p.photo_url || 'https://unsplash.com',
          verified: true,
          interests: p.gender ? [p.gender] : ['Dating']
        }));
        setDbProfiles(formatted);
      }
    } catch (err: any) {
      console.error("Error fetching profiles:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    const { count: likes } = await supabase.from('likes').select('*', { count: 'exact', head: true });
    const { count: reqs } = await supabase.from('message').select('*', { count: 'exact', head: true });
    if (likes) setLikesCount(likes);
    if (reqs) setRequestsCount(reqs);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Sign up successful! Please check your email for verification.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const nextProfile = () => {
    if (dbProfiles.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % dbProfiles.length);
    }
  };

  const handleLike = async () => {
    if (!dbProfiles[currentIndex] || !user) return;
    await supabase.from('likes').insert([
      { id: Math.random().toString(), name: dbProfiles[currentIndex].name }
    ]);
    setLikesCount(prev => prev + 1);
    nextProfile();
  };

  const handleReject = () => {
    nextProfile();
  };

  const handleRequest = async () => {
    if (!dbProfiles[currentIndex] || !user) return;
    await supabase.from('message').insert([
      { id: Math.random().toString(), message_text: `Hi ${dbProfiles[currentIndex].name}, I am interested!` }
    ]);
    setRequestsCount(prev => prev + 1);
    nextProfile();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-border">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mb-3">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-foreground">LoveMatch</h2>
            <p className="text-sm text-muted-foreground mt-1">Connect with verified profiles near you</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-white text-foreground"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Password</label>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-white text-foreground"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg font-semibold shadow-md hover:opacity-90 transition-smooth">
              {authMode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button 
              type="button"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-primary font-medium hover:underline"
            >
              {authMode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || dbProfiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-foreground">
        <div className="text-center">
          <Heart className="w-10 h-10 text-primary animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Finding awesome profiles...</p>
        </div>
      </div>
    );
  }

  const currentProfile = dbProfiles[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">LoveMatch</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              <Lock className="w-4 h-4 inline mr-1" /> 100% Verified Profiles
            </span>
            <button onClick={handleSignOut} className="p-2 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-smooth" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-30 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 flex gap-2 overflow-x-auto">
          {[
            { id: 'discover', label: 'Discover', icon: '👤' },
            { id: 'matches', label: 'Matches', icon: '💕' },
            { id: 'moments', label: 'Moments', icon: '📸' },
            { id: 'live', label: 'Go Live', icon: '📹' },
            { id: 'pricing', label: 'Premium', icon: '✨' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-sm font-medium transition-smooth border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'discover' && (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="relative h-96 bg-muted overflow-hidden">
                  <img src={currentProfile.image} alt={currentProfile.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {currentProfile.verified && (
