import { useState } from 'react';
import { Heart, X, MessageCircle, Video, Share2, Lock, CheckCircle } from 'lucide-react';

interface Profile {
  id: number;
  name: string;
  age: number;
  location: string;
  bio: string;
  image: string;
  verified: boolean;
  interests: string[];
}

const sampleProfiles: Profile[] = [
  {
    id: 1,
    name: "Sarah",
    age: 24,
    location: "Mumbai",
    bio: "Travel enthusiast, love hiking and coffee ☕",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&h=600&fit=crop",
    verified: true,
    interests: ["Travel", "Hiking", "Photography"]
  },
  {
    id: 2,
    name: "Priya",
    age: 26,
    location: "Bangalore",
    bio: "Artist and bookworm. Let's talk about life!",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop",
    verified: true,
    interests: ["Art", "Books", "Music"]
  },
  {
    id: 3,
    name: "Anjali",
    age: 23,
    location: "Delhi",
    bio: "Foodie 🍕 Love trying new cuisines and cultures",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&h=600&fit=crop",
    verified: true,
    interests: ["Food", "Travel", "Cooking"]
  }
];

const subscriptionPlans = [
  { duration: "3 Days", price: 29, period: "₹29" },
  { duration: "1 Week", price: 49, period: "₹49" },
  { duration: "1 Month", price: 99, period: "₹99" }
];

export default function Index() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<number[]>([]);
  const [likes, setLikes] = useState<number[]>([]);
  const [requests, setRequests] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'discover' | 'matches' | 'moments' | 'live' | 'pricing'>('discover');

  const currentProfile = sampleProfiles[currentIndex];

  const handleLike = () => {
    setLikes([...likes, currentProfile.id]);
    nextProfile();
  };

  const handleReject = () => {
    nextProfile();
  };

  const handleRequest = () => {
    setRequests([...requests, currentProfile.id]);
    nextProfile();
  };

  const nextProfile = () => {
    if (currentIndex < sampleProfiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">LoveMatch</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              <Lock className="w-4 h-4 inline mr-1" />
              100% Verified Profiles
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
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
              className={`px-4 py-3 text-sm font-medium transition-smooth border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Profile Image */}
                <div className="relative h-96 bg-muted overflow-hidden">
                  <img
                    src={currentProfile.image}
                    alt={currentProfile.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  
                  {/* Verified Badge */}
                  {currentProfile.verified && (
                    <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-sm font-medium shadow-lg">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </div>
                  )}
                </div>

                {/* Profile Info */}
                <div className="p-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-bold text-foreground">{currentProfile.name}</h2>
                    <span className="text-xl text-muted-foreground">{currentProfile.age}</span>
                  </div>
                  
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    📍 {currentProfile.location}
                  </p>
                  
                  <p className="text-foreground leading-relaxed">{currentProfile.bio}</p>

                  {/* Interests */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {currentProfile.interests.map(interest => (
                      <span
                        key={interest}
                        className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm font-medium"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>

                  {/* Safety Features */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800 flex items-start gap-2">
                    <Lock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Safe & Secure:</strong> Profile verified with ID. Chat is encrypted. Report abuse anytime.
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-border p-6 flex gap-4">
                  <button
                    onClick={handleReject}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground rounded-lg font-semibold transition-smooth hover:bg-muted/80 active:scale-95"
                  >
                    <X className="w-5 h-5" />
                    Pass
                  </button>
                  
                  <button
                    onClick={handleRequest}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold transition-smooth hover:opacity-90 active:scale-95"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Request
                  </button>
                  
                  <button
                    onClick={handleLike}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-lg font-semibold transition-smooth hover:shadow-lg active:scale-95"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                    Like
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-primary">{likes.length}</div>
                  <div className="text-xs text-muted-foreground">Likes Sent</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-secondary">{requests.length}</div>
                  <div className="text-xs text-muted-foreground">Requests Sent</div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-accent">{matches.length}</div>
                  <div className="text-xs text-muted-foreground">Matches</div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Stats */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-bold text-foreground mb-3">Your Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profile Views</span>
                    <span className="font-semibold text-foreground">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Match Rate</span>
                    <span className="font-semibold text-foreground">68%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Messages</span>
                    <span className="font-semibold text-primary">3</span>
                  </div>
                </div>
              </div>

              {/* Safety Tips */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Safety Tips
                </h3>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>✓ Always verify profiles</li>
                  <li>✓ Never share personal details</li>
                  <li>✓ Meet in public places</li>
                  <li>✓ Report suspicious behavior</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === 'matches' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Matches</h2>
            <div className="grid gap-4">
              {matches.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center shadow-sm">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No matches yet. Start liking profiles!</p>
                </div>
              ) : (
                matches.map(matchId => {
                  const profile = sampleProfiles.find(p => p.id === matchId);
                  return (
                    <div key={matchId} className="bg-white rounded-lg p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-smooth">
                      <img src={profile?.image} alt={profile?.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground">{profile?.name}, {profile?.age}</h3>
                        <p className="text-sm text-muted-foreground">{profile?.location}</p>
                      </div>
                      <button className="p-2 hover:bg-primary/10 rounded-lg transition-smooth">
                        <MessageCircle className="w-5 h-5 text-primary" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Share Moments Tab */}
        {activeTab === 'moments' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Share Your Moments</h2>
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <Share2 className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground mb-2">Coming Soon</h3>
              <p className="text-muted-foreground mb-6">Share photos and videos with your matches. Coming in the next update!</p>
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-smooth">
                Notify Me
              </button>
            </div>
          </div>
        )}

        {/* Go Live Tab */}
        {activeTab === 'live' && (
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">Go Live</h2>
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <Video className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground mb-2">Video & Audio Streaming</h3>
              <p className="text-muted-foreground mb-6">Connect with matches via live video and audio calls. Premium feature coming soon!</p>
              <button className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-semibold hover:opacity-90 transition-smooth">
                Learn More
              </button>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-2">Premium Plans</h2>
              <p className="text-muted-foreground">Unlock premium features at unbeatable prices</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {subscriptionPlans.map((plan, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-6 transition-smooth ${
                    idx === 2
                      ? 'bg-gradient-to-br from-primary to-accent text-white shadow-xl scale-105'
                      : 'bg-white text-foreground border border-border shadow-sm hover:shadow-md'
                  }`}
                >
                  <h3 className={`text-lg font-bold mb-2 ${idx === 2 ? 'text-white' : 'text-foreground'}`}>
                    {plan.duration}
                  </h3>
                  <div className={`text-4xl font-bold mb-1 ${idx === 2 ? 'text-white' : 'text-primary'}`}>
                    {plan.period}
                  </div>
                  <p className={`text-sm mb-6 ${idx === 2 ? 'text-white/80' : 'text-muted-foreground'}`}>
                    Limited time offer
                  </p>

                  <ul className={`space-y-2 text-sm mb-6 ${idx === 2 ? 'text-white/90' : 'text-foreground'}`}>
                    <li>✓ Unlimited Likes</li>
                    <li>✓ See Who Liked You</li>
                    <li>✓ Video Calls</li>
                    <li>✓ Share Moments</li>
                    <li>✓ Advanced Filters</li>
                  </ul>

                  <button
                    className={`w-full py-2 rounded-lg font-semibold transition-smooth ${
                      idx === 2
                        ? 'bg-white text-primary hover:bg-white/90'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-bold text-foreground mb-4">Payment Methods</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Credit Card', 'Debit Card', 'UPI', 'Wallet'].map(method => (
                  <div key={method} className="border border-border rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">💳</div>
                    <p className="text-sm font-medium text-foreground">{method}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 bg-foreground text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">About</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Safety</a></li>
                <li><a href="#" className="hover:text-white transition">Verification</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white transition">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition">Report Abuse</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Cookies</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">Facebook</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
            <p>&copy; 2026 LoveMatch. All rights reserved. 100% Verified. 100% Safe.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
