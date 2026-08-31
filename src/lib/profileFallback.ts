export type LocalProfile = {
  id: string;
  age: number | null;
  gender: string;
  city: string;
  bio: string;
  interests: string[];
  avatarUrl: string;
  latitude: number | null;
  longitude: number | null;
  matchDistance: number;
};

const profileKey = (userId: string) => `lovematch-profile:${userId}`;

export const readLocalProfile = (userId: string): LocalProfile | null => {
  try {
    const raw = window.localStorage.getItem(profileKey(userId));
    return raw ? JSON.parse(raw) as LocalProfile : null;
  } catch {
    return null;
  }
};

export const writeLocalProfile = (profile: LocalProfile) => {
  try {
    window.localStorage.setItem(profileKey(profile.id), JSON.stringify(profile));
  } catch {
    // Storage may be unavailable in private browsing or restricted webviews.
  }
};

export const normalizeProfile = (userId: string, value: Record<string, unknown> | null | undefined): LocalProfile | null => {
  if (!value) return null;
  return {
    id: userId,
    age: typeof value.age === 'number' ? value.age : Number(value.age) || null,
    gender: typeof value.gender === 'string' ? value.gender : '',
    city: typeof value.city === 'string' ? value.city : '',
    bio: typeof value.bio === 'string' ? value.bio : '',
    interests: Array.isArray(value.interests) ? value.interests.filter((item): item is string => typeof item === 'string') : [],
    avatarUrl: typeof value.avatar_url === 'string' ? value.avatar_url : typeof value.avatarUrl === 'string' ? value.avatarUrl : '',
    latitude: typeof value.latitude === 'number' ? value.latitude : Number(value.latitude) || null,
    longitude: typeof value.longitude === 'number' ? value.longitude : Number(value.longitude) || null,
    matchDistance: typeof value.match_distance === 'number' ? value.match_distance : Number(value.match_distance) || 25,
  };
};

export const isProfileComplete = (profile: LocalProfile | null): boolean => {
  if (!profile) return false;

  const hasAge = typeof profile.age === 'number' && profile.age >= 18;
  const hasGender = Boolean(profile.gender?.trim());
  const hasCity = Boolean(profile.city?.trim());
  const hasBio = Boolean(profile.bio?.trim());
  const hasInterests = Array.isArray(profile.interests) && profile.interests.length > 0;
  const hasAvatar = Boolean(profile.avatarUrl?.trim());

  return hasAge && hasGender && hasCity && hasBio && hasInterests && hasAvatar;
};
