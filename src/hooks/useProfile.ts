import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_PROFILE, type LearnerProfile, PROFILE_VERSION } from '../lib/profile';
import { loadLocal, saveLocal, STORE_KEYS } from '../lib/userStore';
import { loadActiveRoadmapId, saveActiveRoadmapId } from '../lib/recommend';

function loadGuestProfile(): LearnerProfile {
  const raw = loadLocal<LearnerProfile | null>(STORE_KEYS.profile, null);
  if (raw) return { ...DEFAULT_PROFILE, ...raw };
  const roadmapId = loadActiveRoadmapId();
  return {
    ...DEFAULT_PROFILE,
    roadmapWeights: { [roadmapId]: 1 },
  };
}

function saveGuestProfile(p: LearnerProfile) {
  saveLocal(STORE_KEYS.profile, p);
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<LearnerProfile>(loadGuestProfile);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(loadGuestProfile());
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/learning?action=profile', { credentials: 'include' });
      if (!res.ok) {
        setProfile(loadGuestProfile());
        return;
      }
      const data = await res.json();
      const merged = { ...DEFAULT_PROFILE, ...data.profile };
      setProfile(merged);
      saveGuestProfile(merged);
      const topRoadmap = Object.entries(merged.roadmapWeights).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topRoadmap) saveActiveRoadmapId(topRoadmap);
    } catch {
      setProfile(loadGuestProfile());
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const saveProfile = useCallback(
    async (next: Partial<LearnerProfile>) => {
      const merged: LearnerProfile = {
        ...profile,
        ...next,
        onboardingVersion: PROFILE_VERSION,
        updatedAt: new Date().toISOString(),
      };
      setProfile(merged);
      saveGuestProfile(merged);
      const topRoadmap = Object.entries(merged.roadmapWeights).sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topRoadmap) saveActiveRoadmapId(topRoadmap);

      if (user) {
        try {
          await fetch('/api/learning?action=profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ profile: merged }),
          });
        } catch {
          /* local wins */
        }
      }
      return merged;
    },
    [profile, user]
  );

  return { profile, loading, saveProfile, refresh: fetchProfile };
}
