import { useState } from 'react';
import { Heart, X, Mail, Lock, User, Calendar, MapPin, CheckCircle } from 'lucide-react';

// डमी प्रोफाइल्स की लिस्ट (स्वाइप करने के लिए)
const DUMMY_PROFILES = [
  { id: 1, name: "Neha Sharma", age: 23, city: "Mumbai", bio: "Love traveling, coffee, and good music. Let's chat!", image: "https://unsplash.com" },
  { id: 2, name: "Rahul Verma", age: 25, city: "Delhi", bio: "Fitness enthusiast and foodie. Looking for someone genuine.", image: "https://unsplash.com" },
  { id: 3, name: "Priya Patel", age: 22, city: "Ahmedabad", bio: "Artist 🎨 | Animal lover 🐶 | Let's explore the city together.", image: "https://unsplash.com" }
];

export default function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileCreated, setIsProfileCreated] = useState(false);
  
  // यूज़र डिटेल्स स्टेट्स
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('');

  // स्वाइप स्टेट्स
  const [profileIndex, setProfileIndex] = useState(0);
  const [likesCount, setLikesCount] = useState(0);

  const handleNextProfile = () => {
    setProfileIndex((prev) => (prev + 1) % DUMMY_PROFILES.length);
  };

  const handleLike = () => {
    setLikesCount(likesCount + 1);
    alert(`🎉 You liked ${DUMMY_PROFILES[profileIndex].name}!`);
    handleNextProfile();
  };

  // 1. लॉगिन स्क्रीन
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-pink-100/50">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mb-3 shadow-md shadow-pink-200">
              <Heart className="w-8 h-8 text-white fill-current" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">LoveMatch</h2>
            <p className="text-sm text-gray-500 mt-1">Connect with verified profiles near you</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm focus:ring-2 focus:ring-red-400" placeholder="name@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm focus:ring-2 focus:ring-red-400" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-pink-200 text-sm">Sign In to Match</button>
          </form>
        </div>
      </div>
    );
  }

  // 2. प्रोफाइल क्रिएशन फॉर्म स्क्रीन
  if (!isProfileCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 border border-pink-100/50">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900">Create Your Profile 👤</h3>
            <p className="text-xs text-gray-500 mt-1">Please enter your personal details</p>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setIsProfileCreated(true); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Full Name</label>
              <div className="relative"><User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400" placeholder="John Doe" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Age</label>
                <div className="relative"><Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input type="number" required value={age} onChange={e => setAge(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400" placeholder="24" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-red-400">
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">City / Location</label>
              <div className="relative"><MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input type="text" required value={city} onChange={e => setCity(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-400" placeholder="Mumbai, India" />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-600">Save Profile & Continue</button>
          </form>
        </div>
      </div>
    );
  }

  // 3. मुख्य स्वाइप और डिस्कवर स्क्रीन
  const currentProfile = DUMMY_PROFILES[profileIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex flex-col items-center justify-between py-6 px-4">
      {/* टॉप नेविगेशन बार */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-4 flex justify-between items-center border border-pink-50">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
          <span className="font-extrabold text-xl text-gray-800">LoveMatch</span>
        </div>
        <div className="bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
          <span className="text-xs font-bold text-pink-600">💖 Likes: {likesCount}</span>
        </div>
      </div>

      {/* मुख्य प्रोफाइल कार्ड */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 my-4 flex flex-col justify-between h-[500px]">
        {/* प्रोफाइल फोटो */}
        <div className="relative h-64 bg-gray-100">
          <img src={currentProfile.image} alt={currentProfile.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-2xl font-bold flex items-center gap-1.5">{currentProfile.name}, {currentProfile.age} <CheckCircle className="w-5 h-5 text-blue-400 fill-white" /></h3>
            <p className="text-xs text-gray-200 flex items-center gap-1 mt-0.5">📍 {currentProfile.city}</p>
          </div>
        </div>

        {/* बायो डिस्क्रिप्शन */}
        <div className="p-5 flex-1 flex flex-col justify-start">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Me</span>
          <p className="text-gray-600 text-sm mt-1 leading-relaxed">{currentProfile.bio}</p>
        </div>

        {/* स्वाइप बटन्स */}
        <div className="p-5 border-t border-gray-50 flex gap-4 bg-gray-50/50">
          <button onClick={handleNextProfile} className="flex-1 py-3 bg-white border border-gray-200 text-gray-500 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-gray-100 transition-all active:scale-95">
            <X className="w-5 h-5 text-gray-400" /> Pass
          </button>
          <button onClick={handleLike} className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-pink-100 hover:opacity-95 transition-all active:scale-95">
            <Heart className="w-5 h-5 fill-current" /> Like
          </button>
        </div>
      </div>

      {/* यूज़र का छोटा फुटर */}
      <div className="text-center">
        <p className="text-xs text-gray-400 font-medium">Logged in as <span className="text-gray-600 font-semibold">{name}</span></p>
      </div>
    </div>
  );
}