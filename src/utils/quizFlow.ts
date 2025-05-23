import { quizConfigs, Question } from '../quizConfigs';
import { getProfile, advanceCategory } from '../profileStore';

export function getNextQuestions(maxPerRun = 2): Question[] {
  const profile = getProfile();
  // onboarding: all level-0 not done
  if (!profile.onboardingComplete) {
    const list = quizConfigs.flatMap(qc => qc.questions)
      .filter(q => q.level === 0 && !profile.completedQuestions.includes(q.id));
    return list.slice(0, maxPerRun);
  }
  // daily deepening
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
  localStorage.setItem('collegeism_profile', JSON.stringify(profile));
} 