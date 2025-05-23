export interface Profile {
  name: string;
  dateOfBirth: string;
  location: string;
  musicService: 'spotify' | 'appleMusic';
  completedQuestions: string[];
  categoryQueue: string[];
  onboardingComplete: boolean;
  [key: string]: any; // Allow dynamic fields from quiz answers
}

export const createEmptyProfile = (): Profile => ({
  name: '',
  dateOfBirth: '',
  location: '',
  musicService: 'spotify',
  completedQuestions: [],
  categoryQueue: [],
  onboardingComplete: false
}); 