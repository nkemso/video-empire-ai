'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Loader2, Crown, DollarSign, Zap, TrendingUp, Trophy, 
  Target, Send, History, Settings, LogOut, Menu, X 
} from 'lucide-react';
import toast from 'react-hot-toast';
import GenerationOutput from '@/components/GenerationOutput';
import Link from 'next/link';

const STRATEGY_MODES = [
  { id: 1, name: 'Revenue Capture', icon: DollarSign, color: 'gold', desc: 'Monetization-focused' },
  { id: 2, name: 'YouTube Automation', icon: Zap, color: 'electric', desc: 'Faceless 10-min scripts' },
  { id: 3, name: 'Viral Shorts', icon: TrendingUp, color: 'purple', desc: '60-sec viral content' },
  { id: 4, name: 'Authority Brand', icon: Crown, color: 'gold', desc: 'Personal brand growth' },
  { id: 5, name: 'Full Empire', icon: Trophy, color: 'electric', desc: 'All modes combined ⭐' },
];

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [remaining, setRemaining] = useState(3);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generation, setGeneration] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    topic: '',
    mode: 5,
    audience: '',
    platform: '',
    tone: '',
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      
      if (data.profile) {
        setProfile(data.profile);
        setRemaining(data.remaining_generations);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.topic) {
      toast.error('Please enter a topic');
      return;
    }

    setGenerating(true);
    setGeneration(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          toast.error(data.message || 'Limit reached');
          if (data.upgrade_required) {
            setTimeout(() => router.push('/pricing'), 2000);
          }
          return;
        }
        throw new Error(data.error || 'Generation failed');
      }

      setGeneration(data.generation);
      setRemaining(data.usage.remaining);
      toast.success('Empire generated! 👑');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-empire-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-empire-charcoal border-r border-white/10 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform z-40 flex flex-col`}>
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Crown className="w-8 h-8 text-empire-gold" />
            <span className="font-display font-bold gradient-text">Video Empire</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-empire-gold/10 text-empire-gold">
            <Sparkles className="w-5 h-5" /> Generate
          </Link>
          <Link href="/history" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
            <History className="w-5 h-5" /> History
          </Link>
          <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all">
            <Settings className="w-5 h-5" /> Settings
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="glass-card p-4 mb-4">
            <div className="text-xs text-gray-400 mb-1">Plan</div>
            <div className="font-semibold capitalize gradient-text">
              {profile?.subscription_tier || 'Free'}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {remaining} generations left
            </div>
            {profile?.subscription_tier === 'free' && (
              <Link href="/pricing" className="block mt-3 text-center text-xs bg-empire-gold text-empire-black py-2 rounded-lg font-semibold">
                Upgrade
              </Link>
            )}
          </div>

          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-gray-400">
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        <header className="lg:hidden p-4 border-b border-white/10 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X /> : <Menu />}
          </button>
          <Crown className="w-6 h-6 text-empire-gold" />
        </header>

        <div className="p-6 lg:p-12 max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-display font-bold mb-2">
              Welcome, <span className="gradient-text">{profile?.full_name?.split(' ')[0] || 'Creator'}</span> 👑
            </h1>
            <p className="text-gray-400">Generate your next viral video strategy</p>
          </div>

          {!generation ? (
            <form onSubmit={handleGenerate} className="space-y-6">
              {/* Strategy Modes */}
              <div>
                <label className="block text-sm font-semibold mb-4">Choose Your Strategy</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {STRATEGY_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setFormData({...formData, mode: mode.id})}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        formData.mode === mode.id
                          ? 'border-empire-gold bg-empire-gold/10'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      <mode.icon className={`w-6 h-6 mb-2 text-empire-${mode.color}`} />
                      <div className="font-semibold text-sm mb-1">{mode.name}</div>
                      <div className="text-xs text-gray-400">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Input */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Topic / Niche <span className="text-empire-gold">*</span>
                </label>
                <textarea
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  placeholder="E.g., Faceless YouTube channel about luxury lifestyles, AI tools for entrepreneurs..."
                  className="input-field min-h-[100px] resize-none"
                  required
                />
              </div>

              {/* Optional Fields */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Target Audience</label>
                  <input
                    type="text"
                    value={formData.audience}
                    onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    placeholder="E.g., Gen Z entrepreneurs"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Platform</label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Any</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Instagram Reels">Instagram Reels</option>
                    <option value="YouTube Shorts">YouTube Shorts</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Tone</label>
                  <select
                    value={formData.tone}
                    onChange={(e) => setFormData({...formData, tone: e.target.value})}
                    className="input-field"
                  >
                    <option value="">Default</option>
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual</option>
                    <option value="Bold & Aggressive">Bold & Aggressive</option>
                    <option value="Educational">Educational</option>
                    <option value="Entertaining">Entertaining</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={generating || !formData.topic}
                className="glow-button w-full flex items-center justify-center gap-2 text-lg py-4"
              >
                {generating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Generating Empire...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Empire Strategy
                  </>
                )}
              </button>
            </form>
          ) : (
            <GenerationOutput 
              generation={generation} 
              onNew={() => setGeneration(null)} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
