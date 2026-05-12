import Link from 'next/link';
import { Crown, Twitter, Youtube, Instagram, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-empire-charcoal/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Crown className="w-8 h-8 text-empire-gold" />
              <span className="text-2xl font-display font-bold gradient-text">
                Video Empire AI
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Your AI-powered video strategy director. Generate production-ready scripts, 
              monetization plans, and viral hooks in seconds.
            </p>
            <div className="flex gap-3">
              {[Twitter, Youtube, Instagram, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 bg-white/5 hover:bg-empire-gold/20 hover:text-empire-gold rounded-lg transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/#features" className="hover:text-empire-gold">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-empire-gold">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-empire-gold">Dashboard</Link></li>
              <li><Link href="/api-docs" className="hover:text-empire-gold">API</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/about" className="hover:text-empire-gold">About</Link></li>
              <li><Link href="/contact" className="hover:text-empire-gold">Contact</Link></li>
              <li><Link href="/privacy" className="hover:text-empire-gold">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-empire-gold">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-gray-500 text-sm">
          <p>Built with 👑 by Video Empire AI Team</p>
        </div>
      </div>
    </footer>
  );
}
