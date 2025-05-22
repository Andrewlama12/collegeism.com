/**
 * A thin abstraction over storage, so we can
 * swap between localStorage (MVP) and Supabase later.
 */

const isBrowser = typeof window !== 'undefined';

export async function getArchetype() {
  if (isBrowser) {
    return localStorage.getItem('archetype');
  }
  // TODO: replace with Supabase call
  return null;
}

export async function setArchetype(a) {
  if (isBrowser) {
    localStorage.setItem('archetype', a);
    return;
  }
  // TODO: Supabase upsert profile
}

export async function getPlans() {
  if (isBrowser) {
    const key = getPlanKey();
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
  // TODO: Supabase select plans
  return [];
}

export async function addPlan(planText) {
  if (isBrowser) {
    const key = getPlanKey();
    const arr = JSON.parse(localStorage.getItem(key) || '[]');
    arr.push({ date: new Date().toISOString(), text: planText });
    localStorage.setItem(key, JSON.stringify(arr));
    return;
  }
  // TODO: Supabase insert plan row
}

export function getPlanKey() {
  const now = new Date();
  return `plans-${now.getFullYear()}-${now.getMonth()}`;
}

export async function getStreak() {
  if (isBrowser) {
    const last = localStorage.getItem('last-use');
    const today = new Date().toISOString().slice(0,10);
    let streak = Number(localStorage.getItem('streak') || '0');
    if (last !== today) {
      const prevDate = new Date(last || 0);
      const diff = (new Date(today) - prevDate)/(1000*60*60*24);
      streak = diff === 1 ? streak + 1 : 1;
      localStorage.setItem('streak', String(streak));
      localStorage.setItem('last-use', today);
    }
    return streak;
  }
  // TODO: Supabase read/update streak
  return 0;
}

export async function getPlanCountThisMonth() {
  if (isBrowser) {
    return (await getPlans()).length;
  }
  // TODO: Supabase count plans by month
  return 0;
} 