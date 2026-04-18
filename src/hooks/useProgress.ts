import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth, getAuthToken } from '../contexts/AuthContext';
import type { Progress, Language } from '../types';

const STORAGE_KEY = 'dsa-prep-progress';
const API_URL = import.meta.env.DEV ? 'http://localhost:3001' : '';

function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveProgressLocal(progress: Progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Progress>(loadProgress);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load from DB when user signs in
  useEffect(() => {
    if (!user) return;
    const token = getAuthToken();
    if (!token) return;

    fetch(`${API_URL}/api/progress`, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.progress && typeof data.progress === 'object') {
          // Merge: DB wins for conflicts, localStorage fills gaps
          const local = loadProgress();
          const merged = { ...local, ...data.progress };
          setProgress(merged);
          saveProgressLocal(merged);
        }
      })
      .catch(err => console.error('Failed to load progress:', err));
  }, [user]);

  const syncToDb = useCallback((problemId: string, entry: any) => {
    if (!user) return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      const token = getAuthToken();
      if (!token) return;
      fetch(`${API_URL}/api/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ problemId, data: entry }),
      }).catch(err => console.error('Failed to sync progress:', err));
    }, 500);
  }, [user]);

  const getStatus = useCallback((problemId: string): string => {
    return progress[problemId]?.status || 'unseen';
  }, [progress]);

  const updateStatus = useCallback((problemId: string, status: string) => {
    setProgress(prev => {
      const next: Progress = {
        ...prev,
        [problemId]: { ...prev[problemId], status, lastAttempted: new Date().toISOString() },
      };
      saveProgressLocal(next);
      syncToDb(problemId, next[problemId]);
      return next;
    });
  }, [syncToDb]);

  const getNotes = useCallback((problemId: string): string => {
    return progress[problemId]?.notes || '';
  }, [progress]);

  const saveNotes = useCallback((problemId: string, notes: string) => {
    setProgress(prev => {
      const next: Progress = { ...prev, [problemId]: { ...prev[problemId], notes } };
      saveProgressLocal(next);
      syncToDb(problemId, next[problemId]);
      return next;
    });
  }, [syncToDb]);

  const getSavedCode = useCallback((problemId: string): string | null => {
    return progress[problemId]?.code || null;
  }, [progress]);

  const getSavedLanguage = useCallback((problemId: string): Language => {
    return (progress[problemId]?.language as Language) || 'typescript';
  }, [progress]);

  const saveCode = useCallback((problemId: string, code: string, language: Language) => {
    setProgress(prev => {
      const next: Progress = { ...prev, [problemId]: { ...prev[problemId], code, language } };
      saveProgressLocal(next);
      syncToDb(problemId, next[problemId]);
      return next;
    });
  }, [syncToDb]);

  const isBookmarked = useCallback((problemId: string): boolean => {
    return progress[problemId]?.bookmarked || false;
  }, [progress]);

  const toggleBookmark = useCallback((problemId: string) => {
    setProgress(prev => {
      const next: Progress = {
        ...prev,
        [problemId]: { ...prev[problemId], bookmarked: !prev[problemId]?.bookmarked },
      };
      saveProgressLocal(next);
      syncToDb(problemId, next[problemId]);
      return next;
    });
  }, [syncToDb]);

  const getStats = useCallback(() => {
    const values = Object.values(progress);
    return {
      total: values.length,
      solved: values.filter(v => v.status === 'solved' || v.status === 'mastered').length,
      attempted: values.filter(v => v.status === 'attempted').length,
      mastered: values.filter(v => v.status === 'mastered').length,
    };
  }, [progress]);

  return { progress, getStatus, updateStatus, getNotes, saveNotes, getSavedCode, getSavedLanguage, saveCode, isBookmarked, toggleBookmark, getStats };
}
