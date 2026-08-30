import { useState } from 'react';
import { Camera, MapPin, UserRound } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

type ProfileSetupProps = {
  session: Session;
  onComplete: () => void;
};

const interests = ['Travel', 'Music', 'Movies', 'Fitness', 'Food', 'Art', 'Gaming', 'Reading'];

export default function ProfileSetup({ session, onComplete }: ProfileSetupProps) {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [city, setCity] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const toggleInterest = (interest: string) => {
    setSelectedInterests((current) => current.includes(interest)
      ? current.filter((item) => item !== interest)
      : [...current, interest]);
  };

  const useLocation = () => {
    if (!navigator.geolocation) {
      setMessage('Location is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
        setMessage('Location captured.');
      },
      () => setMessage('Location permission was denied. You can continue without coordinates.'),
    );
  };

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      let avatarUrl = '';
      if (avatarFile) {
        const extension = avatarFile.name.split('.').pop() || 'jpg';
        const path = `${session.user.id}/avatar-${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from('profile-photos')
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('profile-photos').getPublicUrl(path);
        avatarUrl = data.publicUrl;
      }

      const { error } = await supabase.from('profiles').upsert({
        id: session.user.id,
        age: Number(age),
        gender,
        city: city.trim(),
        interests: selectedInterests,
        avatar_url: avatarUrl || null,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (error) throw error;
      onComplete();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 px-4 py-8">
      <div className="mx-auto max-w-xl rounded-[2rem] border border-white bg-white/90 p-6 shadow-2xl shadow-rose-100 backdrop-blur sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200">
            <UserRound className="h-8 w-8" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500">One last step</p>
          <h1 className="mt-2 text-3xl font-black text-gray-900">Build your profile</h1>
          <p className="mt-2 text-sm text-gray-500">Tell people what makes you, you.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block cursor-pointer">
            <span className="mb-2 block text-sm font-bold text-gray-700">Profile picture</span>
            <div className="flex items-center gap-4 rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 p-4">
              {avatarPreview ? <img src={avatarPreview} alt="Profile preview" className="h-20 w-20 rounded-2xl object-cover" /> : <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-rose-400"><Camera /></div>}
              <div><p className="text-sm font-bold text-gray-800">Upload a clear photo</p><p className="mt-1 text-xs text-gray-500">JPG, PNG, or WebP</p></div>
            </div>
            <input type="file" accept="image/*" required={!avatarPreview} onChange={(event) => handleFileChange(event.target.files?.[0])} className="sr-only" />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold text-gray-700">Age<input required min="18" max="100" type="number" value={age} onChange={(event) => setAge(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none focus:border-rose-400" /></label>
            <label className="text-sm font-bold text-gray-700">Gender<select required value={gender} onChange={(event) => setGender(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-3 font-normal outline-none focus:border-rose-400"><option value="">Choose one</option><option>Woman</option><option>Man</option><option>Non-binary</option><option>Prefer not to say</option></select></label>
            <label className="text-sm font-bold text-gray-700">City / location<input required value={city} onChange={(event) => setCity(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-3 font-normal outline-none focus:border-rose-400" /></label>
          </div>

          <div><div className="mb-2 flex items-center justify-between"><span className="text-sm font-bold text-gray-700">Interests</span><span className="text-xs text-gray-400">{selectedInterests.length} selected</span></div><div className="flex flex-wrap gap-2">{interests.map((interest) => <button type="button" key={interest} onClick={() => toggleInterest(interest)} className={`rounded-full border px-3 py-2 text-xs font-bold ${selectedInterests.includes(interest) ? 'border-rose-500 bg-rose-500 text-white' : 'border-gray-200 text-gray-600'}`}>{interest}</button>)}</div></div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-gray-800">Add your location</p><p className="text-xs text-gray-500">Used to find nearby matches.</p></div><MapPin className="h-5 w-5 text-rose-500" /></div><button type="button" onClick={useLocation} className="mt-3 w-full rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-gray-700 shadow-sm ring-1 ring-gray-200">Use current location</button>{latitude && <p className="mt-2 text-xs text-emerald-600">{latitude}, {longitude}</p>}</div>

          {message && <p className="text-center text-sm text-rose-600">{message}</p>}
          <button disabled={saving} className="w-full rounded-xl bg-gray-900 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-rose-600 disabled:opacity-60">{saving ? 'Saving profile...' : 'Enter LoveMatch'}</button>
        </form>
      </div>
    </main>
  );
}
