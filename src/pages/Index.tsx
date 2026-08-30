import { useState, useRef, useEffect } from 'react';
import { Heart, User, Video, CreditCard, Image as ImageIcon, LogOut, Mail, LockKeyhole } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseConfigError } from '../supabaseClient';
import PaymentQr from '../components/PaymentQr';

const formatAuthError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error || 'Unknown authentication error');
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('failed to fetch') || normalizedMessage.includes('network')) {
    return 'Network error: check your internet connection, Supabase project status, and browser extensions, then try again.';
  }

  return message;
};

export default function Index() {
  const navigate = useNavigate();
  // 1. ऑथेंटिकेशन और ऐप कोर स्टेट्स
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('swipe');
  const [likesCount, setLikesCount] = useState(40);
  const [isPremium, setIsPremium] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [walletBalance, setWalletBalance] = useState<number>(1200);
  const [streamerWallet, setStreamerWallet] = useState<number>(0);
  const [redeemedAmount, setRedeemedAmount] = useState<number>(0);
  const [upiId, setUpiId] = useState('');
  const [redeemToday, setRedeemToday] = useState(false);
  const [dailyRedeemedAmount, setDailyRedeemedAmount] = useState(0);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [reportCount, setReportCount] = useState(0);
  const [reportProof, setReportProof] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState(false);
  const [showPaymentQr, setShowPaymentQr] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 2. मीडिया स्टेट्स
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Delhi');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [interests, setInterests] = useState<string[]>([]);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [matchDistance, setMatchDistance] = useState(25);

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
  const maxRedeemPerDay = 10000;
  const redeemableAmount = Math.min(streamerWallet, maxRedeemPerDay);
  const canRedeem = streamerWallet >= minRedeemBalance && !redeemToday && upiId.trim().length > 0 && redeemableAmount > 0;

  // 3. Refs (फाइल अपलोड और वीडियो स्ट्रीमिंग के लिए)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const reportInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // डमी यूजर डेटा
  const name = "राहुल";
  const gender = "Male";

  const hobbyOptions = ['Travel', 'Music', 'Cooking', 'Movies', 'Dancing', 'Gaming', 'Fitness', 'Art', 'Reading', 'Photography'];
  const hasCoordinates = latitude.trim() !== '' && longitude.trim() !== '' && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude));

  useEffect(() => {
    if (!dob) {
      setAge('');
      return;
    }

    const birthDate = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge -= 1;
    }

    setAge(calculatedAge);
  }, [dob]);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      if (supabaseConfigError) {
        setAuthMessage(supabaseConfigError);
        setSessionLoading(false);
        return;
      }

      try {
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (error) {
        setAuthMessage(error.message);
        setSessionLoading(false);
        return;
      }

      setSession(data.session);
      setSessionLoading(false);
      } catch (error) {
        if (isMounted) {
          setAuthMessage(formatAuthError(error));
          setSessionLoading(false);
        }
      }
    };

    syncSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
        setSessionLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleEmailAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthMessage('');

    if (supabaseConfigError) {
      setAuthMessage(supabaseConfigError);
      setAuthLoading(false);
      return;
    }

    try {
      const result = authMode === 'sign-in'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (result.error) {
        setAuthMessage(formatAuthError(result.error));
      } else if (authMode === 'sign-up' && !result.data.session) {
        setAuthMessage('Account created. Check your email to confirm your account, then sign in.');
        setAuthMode('sign-in');
      } else if (result.data.session) {
        navigate('/');
      }
    } catch (error) {
      setAuthMessage(formatAuthError(error));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    stopCamera();
    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthMessage(error.message);
      return;
    }

    setSession(null);
  navigate('/', { replace: true });
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

    const amountToRedeem = Math.min(streamerWallet, maxRedeemPerDay);
    setRedeemedAmount(prev => prev + amountToRedeem);
    setDailyRedeemedAmount(prev => prev + amountToRedeem);
    setStreamerWallet(prev => Number(Math.max(prev - amountToRedeem, 0).toFixed(2)));
    setRedeemToday(true);
  };

  const handleReportProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const nextCount = reportCount + 1;
    setReportProof(URL.createObjectURL(file));
    setReportCount(nextCount);
    if (nextCount >= 10) {
      setIsBanned(true);
    }
  };

  const handleReportStreamer = () => {
    if (isBanned) return;
    if (reportInputRef.current) {
      reportInputRef.current.click();
    }
  };

  const handleLiveStartRequest = () => {
    setShowPrivacyModal(true);
  };

  const confirmLiveStart = async () => {
    setShowPrivacyModal(false);
    await startCamera();
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    setLocationStatus('Fetching your current location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);

        setLatitude(lat);
        setLongitude(lng);
        setLocationStatus('Location captured successfully.');

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
          );
          const data = await response.json();
          const placeName =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.state ||
            'Current location';

          if (placeName && placeName !== 'Current location') {
            setCity(placeName);
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        setLocationLoading(false);
        setLocationStatus(error.message || 'Unable to access your current location.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handlePremiumPlanSelect = (plan: { id: string; name: string; price: string; popular: boolean }) => {
    setSelectedPlan(plan);
    setIsPremium(true);

    setShowPaymentQr(true);
  };

  const handleConfirmPremiumPayment = async () => {
    try {
      const amount = Number((selectedPlan?.price ?? '₹249').replace(/[^\d.]/g, '')) || 249;
      const nextWalletBalance = walletBalance + amount;

      setWalletBalance(nextWalletBalance);
      setShowPaymentQr(false);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            wallet_balance: nextWalletBalance,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (error) {
        console.error('Unable to sync wallet balance:', error);
      }
    } catch (error) {
      console.error('Premium payment confirmation failed:', error);
    }
  };

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest],
    );
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('No active Supabase session found. Please log in first.');
      }

      const { error } = await supabase.from('profiles').upsert({ id: user.id }, { onConflict: 'id' });

      if (error) {
        throw error;
      }

      setProfileMessage('Profile saved successfully with your location coordinates.');
    } catch (error: any) {
      console.error(error);
      setProfileMessage(error.message || 'Unable to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-red-100 flex items-center justify-center p-4">
        <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-xl">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
          <p className="mt-3 text-sm font-semibold text-gray-700">Checking your secure session...</p>
        </div>
      </div>
    );
  }

  // 1. Login / signup landing screen. No dashboard UI renders without a session.
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-red-100 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center space-y-6 border border-pink-100">
          <div className="flex justify-center items-center gap-2">
            <Heart className="w-10 h-10 text-red-500 fill-current animate-bounce" />
            <span className="font-black text-3xl tracking-tight text-gray-800">LoveMatch</span>
          </div>
          <p className="text-gray-500 text-sm">अपने परफेक्ट मैच से जुड़ने के लिए लॉगिन या साइनअप करें</p>
          
          {authMessage && <p className="text-xs text-red-600">{authMessage}</p>}

          <form onSubmit={handleEmailAuth} className="space-y-3 text-left">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                autoComplete="email"
                required
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
                minLength={6}
                required
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100"
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {authLoading ? 'Please wait...' : authMode === 'sign-in' ? 'Sign in with email' : 'Create account'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setAuthMode((mode) => mode === 'sign-in' ? 'sign-up' : 'sign-in');
              setAuthMessage('');
            }}
            className="text-xs font-semibold text-pink-600 hover:text-pink-700"
          >
            {authMode === 'sign-in' ? 'New here? Create an account' : 'Already have an account? Sign in'}
          </button>
          
          <div className="text-xs text-gray-400">By continuing, you agree to our Terms & Privacy Policy</div>
        </div>
      </div>
    );
  }

  if (isBanned) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center space-y-5 border border-red-200">
          <div className="text-6xl">🚫</div>
          <h1 className="text-3xl font-black text-red-600">Account Banned</h1>
          <p className="text-sm text-gray-600">
            This streamer account has been blocked after multiple genuine user reports and proof submissions.
          </p>
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-700"
          >
            Return to Login
          </button>
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
          <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showPrivacyModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-black text-gray-800 text-center">Privacy Policy & Community Rules</h3>
            <div className="mt-4 rounded-2xl bg-red-50 border border-red-200 p-4 text-left text-sm text-gray-700 space-y-2">
              <p><strong>Important:</strong> No pornography, nudity, or slang is allowed in live content.</p>
              <p>Violations may lead to warnings, content removal, or permanent account suspension.</p>
              <p>By clicking Agree, you confirm that your stream follows all platform safety rules.</p>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={confirmLiveStart}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-700"
              >
                Agree
              </button>
            </div>
          </div>
        </div>
      )}

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

            <div className="border-t border-gray-100 pt-4 text-left">
              <div className="flex items-center justify-between">
                <label htmlFor="match-distance" className="text-sm font-bold text-gray-800">Matching distance</label>
                <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-bold text-pink-600">{matchDistance} km</span>
              </div>
              <input
                id="match-distance"
                type="range"
                min="5"
                max="100"
                step="1"
                value={matchDistance}
                onChange={(event) => setMatchDistance(Number(event.target.value))}
                className="mt-3 w-full accent-pink-500"
              />
              <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                <span>5 km</span>
                <span>100 km</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-800">Your location</h4>
                {hasCoordinates && <span className="text-[10px] font-semibold text-green-600">Coordinates saved</span>}
              </div>
              {hasCoordinates ? (
                <>
                  <iframe
                    title="Your saved location"
                    src={`https://www.openstreetmap.org/export/embed.html?layer=mapnik&marker=${Number(latitude)},${Number(longitude)}`}
                    className="mt-3 h-44 w-full rounded-2xl border border-gray-200"
                    loading="lazy"
                  />
                  <p className="mt-2 text-[10px] text-gray-500">
                    {city} · {Number(latitude).toFixed(6)}, {Number(longitude).toFixed(6)}
                  </p>
                </>
              ) : (
                <p className="mt-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                  Add your location in Profile, then save it to show the map here.
                </p>
              )}
            </div>
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
                <button onClick={handleLiveStartRequest} className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-700">Start Live Streaming Now</button>
              )}

              <button
                onClick={handleReportStreamer}
                className="w-full py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl font-bold text-xs shadow-sm hover:bg-red-100"
              >
                Report Streamer
              </button>

              <input
                type="file"
                accept="image/*,video/*"
                ref={reportInputRef}
                onChange={handleReportProofUpload}
                className="hidden"
              />

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

                <div className="space-y-2">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourupi@upi"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none"
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locationLoading}
                    className="w-full rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    {locationLoading ? 'Getting location...' : 'Use current location'}
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Latitude</label>
                      <input
                        type="text"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        placeholder="Latitude"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Longitude</label>
                      <input
                        type="text"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        placeholder="Longitude"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  {locationStatus && (
                    <div className="text-[10px] text-gray-500">{locationStatus}</div>
                  )}
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
                  {redeemToday
                    ? 'Daily withdrawal used up'
                    : canRedeem
                      ? `Redeem ₹${redeemableAmount.toFixed(2)} via UPI`
                      : `Redeem minimum ₹${minRedeemBalance}`}
                </button>

                <div className="text-[10px] text-gray-400">
                  45% of each gift value goes to streamer wallet. Max withdrawal: ₹{maxRedeemPerDay}. Daily limit: once per day. Total redeemed: ₹{redeemedAmount.toFixed(2)}
                </div>
                {reportProof && (
                  <div className="text-[10px] text-gray-500">Last uploaded proof: {reportProof ? 'attached' : 'none'}</div>
                )}
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

        {/* प्रोफाइल / सेटअप टैब */}
        {activeTab === 'profile-setup' && (
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-800 text-center mb-5">Profile Setup</h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-pink-300 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-pink-300 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-pink-300 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  value={age}
                  readOnly
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-600 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="profile-match-distance" className="text-sm font-medium text-gray-700">Matching distance</label>
                  <span className="rounded-full bg-pink-50 px-2.5 py-1 text-xs font-bold text-pink-600">{matchDistance} km</span>
                </div>
                <input
                  id="profile-match-distance"
                  type="range"
                  min="5"
                  max="100"
                  step="1"
                  value={matchDistance}
                  onChange={(event) => setMatchDistance(Number(event.target.value))}
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>5 km</span>
                  <span>100 km</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Use current location</label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                  className="w-full rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {locationLoading ? 'Getting location...' : 'Use current location'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Latitude</label>
                    <input
                      type="text"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="Latitude"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Longitude</label>
                    <input
                      type="text"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="Longitude"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-pink-300 focus:outline-none"
                    />
                  </div>
                </div>

                {locationStatus && <div className="text-[10px] text-gray-500">{locationStatus}</div>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Interests / Hobbies</label>
                <div className="flex flex-wrap gap-2">
                  {hobbyOptions.map((interest) => {
                    const selected = interests.includes(interest);
                    return (
                      <button
                        type="button"
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          selected ? 'border-pink-500 bg-pink-500 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-pink-200'
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full rounded-xl bg-red-500 py-3 text-sm font-bold text-white shadow-md hover:bg-red-600 disabled:opacity-60"
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>

              {profileMessage && <p className="text-center text-xs text-gray-600">{profileMessage}</p>}
            </form>
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
                onClick={() => handlePremiumPlanSelect(plan)}
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
              <button
                type="button"
                onClick={() => setShowPaymentQr(true)}
                className="mt-3 w-full rounded-xl bg-white/20 px-3 py-2 text-xs font-bold text-white hover:bg-white/30"
              >
                Show dynamic QR
              </button>
              {showPaymentQr && (
                <PaymentQr
                  upiId="demo@upi"
                  payeeName="LoveMatch"
                  amount={Number((selectedPlan?.price ?? '₹249').replace(/[^\d.]/g, '')) || 249}
                  onConfirm={handleConfirmPremiumPayment}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <div className="w-full max-w-md fixed bottom-0 left-1/2 -translate-x-1/2 bg-white border-t shadow-lg">
        <div className="grid grid-cols-5 gap-1 p-2">
          {[
            { id: 'swipe', label: 'Swipe', icon: Heart },
            { id: 'live', label: 'Live', icon: Video },
            { id: 'moments', label: 'Moments', icon: ImageIcon },
            { id: 'profile-setup', label: 'Profile', icon: User },
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