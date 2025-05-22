import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Onboard from '../components/Onboard';
import {
  getArchetype,
  setArchetype,
  getPlans,
  addPlan,
  getStreak,
  getPlanCountThisMonth
} from '../lib/storage';
import { useRouter } from 'next/router';

export default function Home() {
  const [archetype, setArchState] = useState(null);
  const [form, setForm] = useState({
    stress: 5,
    caffeine: 'medium',
    alcohol: 'none',
    relationships: 'average',
  });
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);
  const router = useRouter();

  useEffect(() => {
    getArchetype().then(a => {
      if (a) {
        setArchState(a);
        getStreak().then(setStreak);
      }
    });
  }, []);

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  const handleOnboard = async (a) => {
    await setArchetype(a);
    setArchState(a);
    setStreak(await getStreak());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSlider = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
  };

  const generate = async () => {
    setLoading(true);
    setPlan('');
    const count = await getPlanCountThisMonth();
    if (count >= 3) {
      alert('Free limit of 3 plans/month reached. Come back next month!');
      setLoading(false);
      return;
    }
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archetype, ...form }),
    });
    const json = await res.json();
    const text = json.result || json.error || 'No response';
    setPlan(text);
    if (res.ok) {
      await addPlan(text);
      setStreak(await getStreak());
    }
    setLoading(false);
  };

  if (!archetype) {
    return <Onboard onDone={handleOnboard} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">AI Life Planner</h1>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  );
}
