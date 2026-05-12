'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Crown, Sparkles, Heart, Trash2, Eye, Loader2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [generations, setGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('');

  useEffect(() => {
    loadGenerations();
  }, [filterMode]);

  const loadGenerations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterMode) params.set('mode', filterMode);
      
      const res = await fetch(`/api/generations?${params}`);
      const data = await res.json();
      setGenerations(data.generations || []);
    } catch (error) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/generations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !current }),
      });
      loadGenerations();
      toast.success(current ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const deleteGeneration = async (id: string) => {
    if (!confirm('Delete this generation?')) return;
    
    try {
      await fetch(`/api/generations/${id}`, { method: 'DELETE' });
      setGenerations(generations.filter(g => g.id !== id));
      toast.success('Deleted');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const getModeName = (mode: number) => {
    const names = ['', 'Revenue', 'YouTube', 'Shorts', 'Authority', 'Empire'];
    return names[mode];
  };

  const filtered = generations.filter(g =>
    g.topic.toLowerCase().includes(search.toLowerCase()) ||
    g.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 lg:p-12 max-w-6xl mx-auto">
      <div className="mb-8 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white">←</Link>
        <h1 className="text-4xl font-display font-bold gradient-text">Your Empire History</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search generations..."
            className="input-field pl-11"
          />
        </div>
        <select
          value={filterMode}
          onChange={(e) => setFilterMode(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="">All Modes</option>
          <option value="1">Revenue Capture</option>
          <option value="2">YouTube Automation</option>
          <option value="3">Viral Shorts</option>
          <option value="4">Authority Brand</option>
          <option value="5">Full Empire</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-empire-gold" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="w-16 h-16 text-empire-gold/50 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">No generations yet</p>
          <Link href="/dashboard" className="glow-button inline-flex">
            Create Your First
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((gen) => (
            <div key={gen.id} className="premium-card flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="badge-gold">{getModeName(gen.strategy_mode)}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(gen.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-semibold text-lg truncate">{gen.title || gen.topic}</h3>
                <p className="text-sm text-gray-400 truncate">{gen.topic}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleFavorite(gen.id, gen.is_favorite)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <Heart className={`w-5 h-5 ${gen.is_favorite ? 'fill-empire-gold text-empire-gold' : 'text-gray-400'}`} />
                </button>
                <Link href={`/generation/${gen.id}`} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <Eye className="w-5 h-5 text-gray-400" />
                </Link>
                <button
                  onClick={() => deleteGeneration(gen.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
