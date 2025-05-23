export interface Profile {
  name: string;
  dateOfBirth: string;
  location: string;
  musicService: 'spotify' | 'appleMusic';
  hasCompletedMasterQuiz: boolean;
}

const PROFILE_STORAGE_KEY = 'user_profile';

let profile: Profile | null = null;

export function getProfile(): Profile | null {
  if (profile) return profile;
  
  const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (stored) {
    profile = JSON.parse(stored);
    return profile;
  }
  
  return null;
}

export function saveProfile(newProfile: Profile): void {
  profile = newProfile;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(newProfile));
}

export function clearProfile(): void {
  profile = null;
  localStorage.removeItem(PROFILE_STORAGE_KEY);
}

export function setTrait(key: string, value: any) {
  const profile = getProfile();
  profile[key] = value;
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function markQuestionDone(qid: string) {
  const profile = getProfile();
  if (!profile.completedQuestions.includes(qid)) {
    profile.completedQuestions.push(qid);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
}

export function advanceCategory() {
  const profile = getProfile();
  const [first, ...rest] = profile.categoryQueue;
  profile.categoryQueue = [...rest, first];
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

import { quizConfigs, Question } from './quizConfigs';

export function getNextQuestions(maxPerRun = 2): Question[] {
  const profile = getProfile();
  if (!profile.onboardingComplete) {
    const list = quizConfigs.flatMap(qc => qc.questions)
      .filter(q => q.level === 0 && !profile.completedQuestions.includes(q.id));
    return list.slice(0, maxPerRun);
  }
  const cat = profile.categoryQueue[0];
  const cfg = quizConfigs.find(q => q.id === cat)!;
  const list = cfg.questions
    .filter(q => q.level > 0 && !profile.completedQuestions.includes(q.id));
  return list.slice(0, maxPerRun);
}

export function completeRun() {
  const profile = getProfile();
  if (!profile.onboardingComplete) {
    profile.onboardingComplete = true;
  } else {
    advanceCategory();
  }
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
} 