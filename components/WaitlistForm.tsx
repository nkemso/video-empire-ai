'use client';

import { useState } from 'react';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, referral_source: 'landing' }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      setSuccess(true);
      toast.success('You\'re on the list! 👑');
    } catch (error: any) {
      toast.error(error.message || 'Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="glass-card p-8 text-center max-w-md mx-auto">
        <CheckCircle className="w-16 h-16 text-empire-gold mx-auto mb-4" />
        <h3 className="text-2xl font-display font-bold mb-2">You're In! 🎉</h3>
        <p className="text-gray-400">We'll email you when new features launch</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="input-field pl-11"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="glow-button flex items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
        </button>
      </div>
    </form>
  );
        }
