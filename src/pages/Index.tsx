import { useState } from 'react';
import { Heart, User, Video, CreditCard, Image as ImageIcon } from 'lucide-react';

export default function Index() {
  // 1. स्टेट वेरिएबल्स (States)
  const [activeTab, setActiveTab] = useState('swipe');
  const [likesCount, setLikesCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  // 2. डमी यूजर डेटा
  const name = "राहुल";
  const city = "दिल्ली";
  const age = 24;
  const gender = "Male";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-between pb-16">
      {/* हेडर बार */}
      <div className="w-full max-w-md bg-white shadow-sm p-4 flex justify-between items-center border-b sticky top-0 z-50">
        <div className="flex items-center gap-1.5">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
          <span className="font-extrabold text-xl tracking-tight text-gray-800">LoveMatch</span>
        </div>
        <div className="flex gap-2">
          <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold border border-pink-100">
            💖 Likes: {likesCount}/50
          </span>
          {isPremium && (
            <span className="bg-yellow-400 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
              ★ VIP
            </span>
          )}
        </div>
      </div>

      {/* मुख्य कंटेंट एरिया */}
      <div className="w-full max-w-md p-4 flex-1 flex flex-col justify-center">
        {/* स्वाइप / डिस्कवर टैब */}
        {activeTab === 'swipe' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 text-center space-y-4 border border-gray-100">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto text-pink-500">
              <User className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Welcome, {name}!</h3>
            <p className="text-sm text-gray-500">📍 {city} | Age: {age} ({gender})</p>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-2xl text-white shadow-md">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Unlock Requirements</p>
              <p className="text-sm mt-1 font-medium">लाइव स्ट्रीमिंग और मोमेंट्स के लिए 50 लाइक्स चाहिए या प्रीमियम लें!</p>
            </div>
            <button 
              onClick={() => setLikesCount(prev => prev + 10)} 
              className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-600 transition"
            >
              Simulate Getting +10 Likes 👍
            </button>
          </div>
        )}

        {/* लाइव स्ट्रीमिंग टैब */}
        {activeTab === 'live' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 text-center border border-gray-100">
            {likesCount >= 50 || isPremium ? (
              <div className="space-y-4">
                <div className="w-full h-48 bg-black rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold animate-pulse">● LIVE</div>
                  <Video className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">You are ready to Go Live! 📹</h3>
                <button 
                  onClick={() => alert("🎥 आपकी लाइव स्ट्रीमिंग शुरू हो रही है...")} 
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-md"
                >
                  Start Live Streaming Now
                </button>
              </div>
            ) : (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">🔒</div>
                <h3 className="text-lg font-bold text-gray-800">Live Streaming is Locked!</h3>
                <p className="text-xs text-gray-500 px-4">इस फीचर को खोलने के लिए कम से कम 50 लाइक्स हासिल करें या अभी वीआईपी प्रीमियम सब्सक्रिप्शन लें।</p>
                <button onClick={() => setActiveTab('premium')} className="px-5 py-2 bg-yellow-500 text-white rounded-xl font-bold text-xs shadow-sm">Upgrade to Premium ✨</button>
              </div>
            )}
          </div>
        )}

        {/* मोमेंट्स टैब */}
        {activeTab === 'moments' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 text-center border border-gray-100">
            {likesCount >= 50 || isPremium ? (
              <div className="space-y-4 text-left">
                <h3 className="text-xl font-bold text-gray-800 text-center">Share Your Moment 📸</h3>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50">
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">Click to capture or upload your story</p>
                </div>
                <button 
                  onClick={() => alert("🚀 आपका मोमेंट सफलतापूर्वक शेयर हो गया है!")} 
                  className="w-full py-2.5 bg-pink-500 text-white rounded-xl font-bold text-sm shadow-md"
                >
                  Post Story
                </button>
              </div>
            ) : (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">🔒</div>
                <h3 className="text-lg font-bold text-gray-800">Moments Page is Locked!</h3>
                <p className="text-xs text-gray-500 px-4">स्टोरीज और मोमेंट्स शेयर करने के लिए 50 लाइक्स की जरूरत है। प्रीमियम यूजर्स के लिए यह तुरंत उपलब्ध है।</p>
                <button onClick={() => setActiveTab('premium')} className="px-5 py-2 bg-yellow-500 text-white rounded-xl font-bold text-xs shadow-sm">Unlock with Premium ✨</button>
              </div>
            )}
          </div>
        )}

        {/* प्रीमियम वीआईपी टैब */}
        {activeTab === 'premium' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 space-y-5">
            <div className="text-center">
              <h3 className="text-2xl font-black text-gray-800">LoveMatch Premium ✨</h3>
              <p className="text-xs text-gray-400 mt-0.5">Unlock Live Streaming & Moments Instantly</p>
            </div>
            {!selectedPlan ? (
              <div className="space-y-3">
                {[
                  { name: "3 Days VIP Pack", price: "₹29", desc: "Quick unlock testing" },
                  { name: "1 Week Full Access", price: "₹49", desc: "Most popular choice" },
                  { name: "1 Month VIP Gold", price: "₹99", desc: "Best value subscription" }
                ].map(p => (
                  <div key={p.name} onClick={() => setSelectedPlan(p)} className="border p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-yellow-50/20 transition">
                    <div>
                      <p className="font-bold text-sm text-gray-800">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.desc}</p>
                    </div>
                    <span className="bg-yellow-400 text-white font-black px-3 py-1 rounded-xl text-xs shadow-sm">{p.price}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-5 rounded-2xl border text-center space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-xs text-gray-500 font-medium">Selected Plan:</span>
                  <span className="font-bold text-sm text-gray-800">{selectedPlan.name}</span>
                </div>
                <div className="py-2 bg-white border rounded-xl shadow-inner font-mono text-xl font-black text-yellow-600">{selectedPlan.price}</div>
                <p className="text-xs text-gray-400">Scan QR Code or Pay via UPI ID (Google Pay / PhonePe / Paytm)</p>
                <button 
                  onClick={() => { setIsPremium(true); setSelectedPlan(null); setActiveTab('swipe'); alert("🎉 UPI पेमेंट सफल! प्रीमियम फीचर्स अनलॉक हो चुके हैं।"); }} 
                  className="w-full py-3 bg-green-500 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-4 h-4" /> Pay Securely via UPI
                </button>
                <button onClick={() => setSelectedPlan(null)} className="text-xs text-gray-400 hover:underline block mx-auto">Change Plan</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* बॉटम नेविगेशन बार (अब कोष्ठक पूरी तरह से सही हैं) */}
      <div className="w-full max-w-md bg-white border-t fixed bottom-0 flex justify-around py-2.5 z-50 shadow-lg">
        <button onClick={() => setActiveTab('swipe')} className={`flex flex-col items-center text-xs font-semibold ${activeTab === 'swipe' ? 'text-red-500' : 'text-gray-400'}`}>
          <span className="text-lg">👤</span> Discover
        </button>
        <button onClick={() => setActiveTab('live')} className={`flex flex-col items-center text-xs font-semibold ${activeTab === 'live' ? 'text-red-500' : 'text-gray-400'}`}>
          <span className="text-lg">📹</span> Go Live
        </button>
        <button onClick={() => setActiveTab('moments')} className={`flex flex-col items-center text-xs font-semibold ${activeTab === 'moments' ? 'text-red-500' : 'text-gray-400'}`}>
          <span className="text-lg">📸</span> Moments
        </button>
        <button onClick={() => setActiveTab('premium')} className={`flex flex-col items-center text-xs font-semibold ${activeTab === 'premium' ? 'text-yellow-600 font-bold' : 'text-gray-400'}`}>
          <span className="text-lg">✨</span> VIP Premium
        </button>
      </div>
    </div>
  );
}