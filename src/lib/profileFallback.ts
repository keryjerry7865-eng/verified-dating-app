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
    avatarUrl: typeof value.avatar_url === 'string' ? value.avatar_url : '',
    latitude: typeof value.latitude === 'number' ? value.latitude : Number(value.latitude) || null,
    longitude: typeof value.longitude === 'number' ? value.longitude : Number(value.longitude) || null,
    matchDistance: typeof value.match_distance === 'number' ? value.match_distance : Number(value.match_distance) || 25,
  };
};
