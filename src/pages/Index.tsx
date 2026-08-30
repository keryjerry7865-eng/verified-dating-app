import { useState, useRef } from 'react';
import { Heart, User, Video, CreditCard, Image as ImageIcon, LogOut } from 'lucide-react';

export default function Index() {
  // 1. ऑथेंटिकेशन और ऐप कोर स्टेट्स
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('swipe');
  const [likesCount, setLikesCount] = useState(40);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(1200);
  const [streamerWallet, setStreamerWallet] = useState<number>(0);
  const [redeemedAmount, setRedeemedAmount] = useState<number>(0);

  // 2. मीडिया स्टेट्स
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const giftCatalog = [
    { name: 'Rose', price: 5, icon: '🌹' },
    { name: 'Lipstick', price: 10, icon: '💄' },
    { name: 'Ring', price: 15, icon: '💍' },
    { name: 'Bangles', price: 25, icon: '🧿' },
    { name: 'Ear Rings', price: 50, icon: '👂' },
    { name: 'Diamond', price: 99, icon: '💎' },
    { name: 'Dress', price: 149, icon: '👗' },
    { name: 'Princess Dress', price: 199, icon: '👑' },
    { name: 'Crown', price: 249, icon: '👑' },
    { name: 'Car', price: 299, icon: '🚗' },
    { name: 'Sports Car', price: 349, icon: '🏎️' },
    { name: 'Luxury Car', price: 399, icon: '🚙' },
    { name: 'Executive Car', price: 449, icon: '🚕' },
    { name: 'Royal Car', price: 499, icon: '🚓' },
  ] as const;

  const minRedeemBalance = 500;
  const canRedeem = streamerWallet >= minRedeemBalance;

  // 3. Refs (फाइल अपलोड और वीडियो स्ट्रीमिंग के लिए)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // डमी यूजर डेटा
  const name = "राहुल";
  const city = "दिल्ली";
  const age = 24;
  const gender = "Male";

  // गूगल लॉगिन सिमुलेशन
  const handleGoogleLogin = () => {
    setAuthLoading(true);
    setTimeout(() => {
      setIsLoggedIn(true);
      setAuthLoading(false);
    }, 1500);
  };

  // फाइल अपलोड इनपुट को ट्रिगर करना
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // चुनी गई इमेज का प्रीव्यू सेट करना
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // असली कैमरा चालू करना (Live Streaming)
  const startCamera = async () => {
    try {
      setIsStreaming(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("कैमरा एक्सेस करने में विफल: कृपया कैमरा परमिशन चेक करें।");
      setIsStreaming(false);
    }
  };

  // कैमरा बंद करना
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsStreaming(false);
  };

  const handleGiftSend = (gift: (typeof giftCatalog)[number]) => {
    if (walletBalance < gift.price) {
      alert('Your wallet balance is too low for this gift.');
      return;
    }

    setWalletBalance(prev => prev - gift.price);
    const streamerShare = Number((gift.price * 0.45).toFixed(2));
    setStreamerWallet(prev => Number((prev + streamerShare).toFixed(2)));
  };

  const handleRedeem = () => {
    if (!canRedeem) {
      return;
    }

    setRedeemedAmount(prev => prev + streamerWallet);
    setStreamerWallet(0);
  };

  // 1. लॉगिन / साइनअप यूआई (यदि लॉगइन नहीं है)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-red-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-pink-100">
          <div className="flex justify-center items-center gap-2">
            <Heart className="w-10 h-10 text-red-500 fill-current animate-bounce" />
            <span className="font-black text-3xl tracking-tight text-gray-800">LoveMatch</span>
          </div>
          <p className="text-gray-500 text-sm">अपने परफेक्ट मैच से जुड़ने के लिए लॉगिन या साइनअप करें</p>
          
          <button 
            onClick={handleGoogleLogin}
            disabled={authLoading}
            className="w-full py-3.5 bg-white border-2 border-gray-200 rounded-xl font-bold text-sm text-gray-700 shadow-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition active:scale-95 disabled:opacity-50"
          >
            {authLoading ? (
              <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.227C18.216 1.414 15.48 0 12.24 0 5.58 0 0 5.58 0 12.24s5.58 12.24 12.24 12.24c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.905H12.24z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          <div className="text-xs text-gray-400">By continuing, you agree to our Terms & Privacy Policy</div>
        </div>
      </div>
    );
  }

  // 2. मुख्य एप्लिकेशन यूआई (लॉगिन होने के बाद)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-between pb-16">
      {/* हेडर बार */}
      <div className="w-full max-w-md bg-white shadow-sm p-4 flex justify-between items-center border-b sticky top-0 z-50">
        <div className="flex items-center gap-1.5">
          <Heart className="w-6 h-6 text-red-500 fill-current" />
          <span className="font-extrabold text-xl tracking-tight text-gray-800">LoveMatch</span>
        </div>
        <div className="flex gap-2 items-center">
          <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold border border-pink-100">
            💖 Likes: {likesCount}/50
          </span>
          {isPremium ? (
            <span className="bg-yellow-400 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">★ VIP</span>
          ) : (
            <span className="bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full text-xs font-bold">Free</span>
          )}
          <button onClick={() => { stopCamera(); setIsLoggedIn(false); }} className="text-gray-400 hover:text-red-500 p-1">
            <LogOut className="w-4 h-4" />
          </button>
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
              onClick={() => setLikesCount(prev => Math.min(prev + 10, 50))} 
              className="w-full py-3 bg-red-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-600 transition"
            >
              Simulate Getting +10 Likes 👍
            </button>
          </div>
        )}

        {/* लाइव स्ट्रीमिंग टैब */}
        {activeTab === 'live' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 text-center border border-gray-100">
            <div className="space-y-4">
              <div className="w-full h-64 bg-black rounded-2xl flex items-center justify-center relative overflow-hidden shadow-inner">
                {isStreaming ? (
                  <>
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold animate-pulse z-10">● LIVE</div>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]"></video>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <Video className="w-12 h-12 text-gray-500 mx-auto" />
                    <p className="text-xs text-gray-400">कैमरा रेडी है</p>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-800">You are ready to Go Live! 📹</h3>
              {isStreaming ? (
                <button onClick={stopCamera} className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold text-sm shadow-md">Stop Streaming</button>
              ) : (
                <button onClick={startCamera} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-700">Start Live Streaming Now</button>
              )}

              <div className="space-y-3 border-t border-gray-100 pt-4 text-left">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Wallet: ₹{walletBalance}</span>
                  <span>Streamer wallet: ₹{streamerWallet.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {giftCatalog.map((gift) => (
                    <button
                      key={`${gift.name}-${gift.price}`}
                      onClick={() => handleGiftSend(gift)}
                      className="rounded-2xl border border-pink-100 bg-pink-50/40 p-2 text-center transition hover:border-pink-200 hover:bg-pink-50"
                    >
                      <div className="text-2xl mb-1">{gift.icon}</div>
                      <div className="text-[10px] font-bold text-gray-700 leading-tight">{gift.name}</div>
                      <div className="mt-1 text-[10px] font-semibold text-pink-600">₹{gift.price}</div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleRedeem}
                  disabled={!canRedeem}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition ${
                    canRedeem
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canRedeem ? `Redeem ₹${streamerWallet.toFixed(2)}` : `Redeem minimum ₹${minRedeemBalance}`}
                </button>

                <div className="text-[10px] text-gray-400">
                  45% of each gift value goes to the streamer wallet. Total redeemed: ₹{redeemedAmount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* मोमेंट्स टैब */}
        {activeTab === 'moments' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            {likesCount >= 50 || isPremium ? (
              <div className="space-y-4 text-left">
                <h3 className="text-xl font-bold text-gray-800 text-center">Share Your Moment 📸</h3>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                <div
                  onClick={triggerFileUpload}
                  className="border-2 border-dashed border-pink-200 rounded-2xl p-4 text-center bg-pink-50/30 cursor-pointer hover:bg-pink-50 transition min-h-[180px] flex flex-col justify-center items-center"
                >
                  {uploadedImage ? (
                    <div className="w-full overflow-hidden rounded-2xl">
                      <img src={uploadedImage} alt="Uploaded preview" className="w-full h-52 object-cover rounded-2xl" />
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-10 h-10 text-pink-400 mb-2" />
                      <p className="font-semibold text-pink-500">Upload a moment</p>
                      <p className="text-xs text-gray-400 mt-1">Tap to choose a photo</p>
                    </>
                  )}
                </div>

                {uploadedImage && (
                  <button
                    onClick={() => setUploadedImage(null)}
                    className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            ) : (
              <div className="py-8 space-y-4 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">🔒</div>
                <h3 className="text-lg font-bold text-gray-800">Moments are Locked!</h3>
                <p className="text-xs text-gray-500 px-4">Unlock moments by getting 50 likes or upgrading to premium.</p>
                <button onClick={() => setActiveTab('premium')} className="px-5 py-2 bg-yellow-500 text-white rounded-xl font-bold text-xs shadow-sm">Upgrade to Premium ✨</button>
              </div>
            )}
          </div>
        )}

        {/* प्रीमियम टैब */}
        {activeTab === 'premium' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 space-y-5">
            <h3 className="text-2xl font-bold text-gray-800 text-center">Choose Your Plan</h3>

            {[
              { id: 'weekly', name: 'Weekly Match & Chat', price: '₹49', popular: false },
              { id: 'monthly', name: 'Monthly Match & Chat', price: '₹139', popular: false },
              { id: 'video', name: 'Video & Moments Premium', price: '₹249', popular: true },
            ].map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  setSelectedPlan(plan);
                  setIsPremium(true);
                  setActiveTab('swipe');
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedPlan?.id === plan.id || plan.popular
                    ? 'border-yellow-400 bg-yellow-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-pink-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-gray-800">{plan.name}</div>
                    <div className="text-xs text-gray-500">
                      Best for {plan.name === 'Video & Moments Premium' ? 'premium content access' : 'chat and match upgrades'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-lg text-gray-800">{plan.price}</div>
                    {plan.popular && <span className="text-[10px] font-bold text-yellow-700">MOST POPULAR</span>}
                  </div>
                </div>
              </button>
            ))}

            <div className="rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 p-4 text-white text-center">
              <div className="flex items-center justify-center gap-2 text-sm font-bold">
                <CreditCard className="w-4 h-4" /> Secure payment
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="w-full max-w-md fixed bottom-0 left-1/2 -translate-x-1/2 bg-white border-t shadow-lg">
        <div className="grid grid-cols-4 gap-1 p-2">
          {[
            { id: 'swipe', label: 'Swipe', icon: Heart },
            { id: 'live', label: 'Live', icon: Video },
            { id: 'moments', label: 'Moments', icon: ImageIcon },
            { id: 'premium', label: 'Premium', icon: CreditCard },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] font-semibold transition ${
                activeTab === id ? 'text-red-500 bg-red-50' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}