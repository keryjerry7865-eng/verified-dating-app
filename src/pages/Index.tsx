import { useState } from 'react';
import { Heart, Mail, Lock, User } from 'lucide-react';

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("कृपया सभी डिटेल्स भरें!");
      return;
    }
    // अभी के लिए हम सीधे लॉगिन करा रहे हैं, अगले स्टेप में प्रोफाइल क्रिएशन जोड़ेंगे
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-pink-100/50">
          
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-3 shadow-md shadow-pink-200">
              <Heart className="w-8 h-8 text-white fill-current" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">LoveMatch</h2>
            <p className="text-sm text-gray-500 mt-1">Connect with verified profiles near you</p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleAuthSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition-all text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                <input 
                  type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-pink-200 hover:opacity-95 transition-all active:scale-[0.98] mt-2 text-sm">
              {authMode === 'signin' ? 'Sign In to Match' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center text-sm border-t border-gray-100 pt-5">
            <button 
              type="button"
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-red-500 font-semibold hover:underline transition-all"
            >
              {authMode === 'signin' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // लॉगिन होने के बाद की स्क्रीन (अभी के लिए डमी टेक्स्ट, अगले स्टेप में प्रोफाइल फॉर्म लाएंगे)
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white p-4">
      <div className="text-center bg-green-50 p-6 rounded-2xl max-w-sm border border-green-100">
        <p className="text-green-600 font-bold text-lg mb-2">🎉 Login Successful!</p>
        <p className="text-gray-500 text-sm">अब हम अगले स्टेप में प्रोफाइल डिटेल्स भरने का फॉर्म बनाएंगे।</p>
      </div>
    </div>
  );
}