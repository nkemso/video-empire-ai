'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  Copy, Download, RefreshCw, Heart, Share2, 
  CheckCircle, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  generation: {
    id: string;
    title: string;
    content: string;
    mode: number;
    topic: string;
    created_at: string;
  };
  onNew: () => void;
}

const MODE_NAMES = ['', 'Revenue Capture', 'YouTube Automation', 'Viral Shorts', 'Authority Brand', 'Full Empire'];
const MODE_COLORS = ['', 'gold', 'electric', 'purple', 'gold', 'electric'];

export default function GenerationOutput({ generation, onNew }: Props) {
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generation.content);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generation.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generation.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const handleFavorite = async () => {
    try {
      await fetch(`/api/generations/${generation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !favorited }),
      });
      setFavorited(!favorited);
      toast.success(favorited ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: generation.title,
          text: `Check out this AI-generated video strategy: ${generation.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge-${MODE_COLORS[generation.mode]}`}>
                {MODE_NAMES[generation.mode]}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(generation.created_at).toLocaleString()}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold gradient-text mb-2">
              {generation.title}
            </h1>
            <p className="text-gray-400 text-sm">
              <strong>Topic:</strong> {generation.topic}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-empire-gold/10 hover:bg-empire-gold/20 text-empire-gold rounded-lg transition-all"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-empire-electric/10 hover:bg-empire-electric/20 text-empire-electric rounded-lg transition-all"
          >
            <Download className="w-4 h-4" /> Download
          </button>
          <button
            onClick={handleFavorite}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              favorited 
                ? 'bg-red-500/20 text-red-400' 
                : 'bg-white/5 hover:bg-white/10 text-gray-400'
            }`}
          >
            <Heart className={`w-4 h-4 ${favorited ? 'fill-current' : ''}`} />
            {favorited ? 'Favorited' : 'Favorite'}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 bg-empire-purple/10 hover:bg-empire-purple/20 text-empire-purple rounded-lg transition-all"
          >
            <Share2 className="w-4 h-4" /> Share
          </button>
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all ml-auto"
          >
            <Sparkles className="w-4 h-4" /> New Generation
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="glass-card p-8">
        <article className="prose prose-invert prose-lg max-w-none
          prose-headings:font-display prose-headings:gradient-text
          prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
          prose-p:text-gray-300 prose-p:leading-relaxed
          prose-strong:text-empire-gold prose-strong:font-semibold
          prose-em:text-empire-electric
          prose-code:bg-empire-charcoal prose-code:text-empire-gold prose-code:px-2 prose-code:py-1 prose-code:rounded
          prose-pre:bg-empire-charcoal prose-pre:border prose-pre:border-white/10
          prose-blockquote:border-l-4 prose-blockquote:border-empire-gold prose-blockquote:text-gray-300
          prose-ul:text-gray-300 prose-ol:text-gray-300
          prose-li:marker:text-empire-gold
          prose-table:border prose-table:border-white/10
          prose-th:bg-empire-charcoal prose-th:text-empire-gold
          prose-td:border-white/10
          prose-a:text-empire-electric prose-a:no-underline hover:prose-a:underline
          prose-hr:border-white/10
        ">
          <ReactMarkdown>{generation.content}</ReactMarkdown>
        </article>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-center">
        <button
          onClick={onNew}
          className="glow-button flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Generate Another Empire
        </button>
      </div>
    </div>
  );
    }
