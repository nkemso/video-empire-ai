'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { User, Mail, Globe, Crown, Loader2, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    country: 'NG',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      setProfile(data.profile);
      setFormData({
        full_name: data.profile.full_name || '',
        country: data.profile.country || 'NG',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success('Profile updated!');
      loadProfile();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-empire-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-12 max-w-4xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white">←</Link>
        <h1 className="text-4xl font-display font-bold gradient-text">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Subscription Card */}
        <div className="premium-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-display font-bold flex items-center gap-2">
              <Crown className="w-6 h-6 text-empire-gold" />
              Subscription
            </h2>
            <span className="badge-gold capitalize">{profile.subscription_tier}</span>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Status</div>
              <div className="font-semibold capitalize">{profile.subscription_status}</div>
            </div>
            <div>
              <div className="text-gray-400">Provider</div>
              <div className="font-semibold capitalize">{profile.subscription_provider || 'N/A'}</div>
            </div>
            <div>
              <div className="text-gray-400">Total Generations</div>
              <div className="font-semibold">{profile.generations_count}</div>
            </div>
            <div>
              <div className="text-gray-400">This Month</div>
              <div className="font-semibold">{profile.generations_this_month}</div>
            </div>
          </div>

          {profile.subscription_tier === 'free' && (
            <Link href="/#pricing" className="glow-button inline-flex mt-4">
              Upgrade Plan
            </Link>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSave} className="premium-card space-y-4">
          <h2 className="text-2xl font-display font-bold mb-4">Profile Information</h2>

          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={profile.email}
                disabled
                className="input-field pl-11 opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="input-field pl-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Country</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
                className="input-field pl-11"
              >
                <option value="NG">🇳🇬 Nigeria</option>
                <option value="US">🇺🇸 United States</option>
                <option value="GB">🇬🇧 United Kingdom</option>
                <option value="CA">🇨🇦 Canada</option>
                <option value="AU">🇦🇺 Australia</option>
                <option value="IN">🇮🇳 India</option>
                <option value="ZA">🇿🇦 South Africa</option>
                <option value="KE">🇰🇪 Kenya</option>
                <option value="GH">🇬🇭 Ghana</option>
                <option value="OTHER">🌍 Other</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="glow-button flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
