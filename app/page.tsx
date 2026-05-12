import Link from 'next/link';
import { ArrowRight, Sparkles, Zap, Trophy, Crown, TrendingUp, DollarSign, Users, Target } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingSection from '@/components/PricingSection';
import WaitlistForm from '@/components/WaitlistForm';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-empire-gold/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-empire-electric/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge-gold mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Powered by Google Gemini AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black mb-6 leading-tight">
            Build Your <br />
            <span className="gradient-text text-shadow-gold">Video Empire</span><br />
            with AI
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Generate <span className="text-empire-gold font-semibold">production-ready video scripts</span>, 
            <span className="text-empire-electric font-semibold"> monetization strategies</span>, and 
            <span className="text-empire-purple font-semibold"> viral hooks</span> in seconds.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup" className="glow-button inline-flex items-center justify-center gap-2 text-lg">
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="#pricing" className="px-8 py-3 border border-white/20 rounded-xl text-white font-semibold hover:bg-white/10 transition-all">
              View Pricing
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, label: 'Active Creators', value: '10K+' },
              { icon: Sparkles, label: 'Scripts Generated', value: '500K+' },
              { icon: TrendingUp, label: 'Views Generated', value: '1B+' },
              { icon: DollarSign, label: 'Revenue Earned', value: '$5M+' },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4">
                <stat.icon className="w-6 h-6 text-empire-gold mx-auto mb-2" />
                <div className="text-2xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODES SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-electric mb-4 inline-flex">5 Strategic Modes</div>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">
              Choose Your <span className="gradient-text">Strategy</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              5 powerful modes designed for every type of content creator
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: DollarSign,
                title: 'Revenue Capture',
                desc: 'Monetization-focused scripts with affiliate placements and funnel mapping',
                color: 'gold',
              },
              {
                icon: Zap,
                title: 'YouTube Automation',
                desc: 'Faceless 10-min scripts optimized for AI voice and stock footage',
                color: 'electric',
              },
              {
                icon: TrendingUp,
                title: 'Viral Shorts',
                desc: '60-sec dopamine-engineered scripts for TikTok, Reels & Shorts',
                color: 'purple',
              },
              {
                icon: Crown,
                title: 'Authority Brand',
                desc: 'Position yourself as a thought leader with 30-day roadmaps',
                color: 'gold',
              },
              {
                icon: Trophy,
                title: 'Full Empire',
                desc: 'Complete 360° system combining all modes for total domination',
                color: 'electric',
                featured: true,
              },
              {
                icon: Target,
                title: 'Coming Soon',
                desc: 'Custom AI agents trained on YOUR brand voice and style',
                color: 'purple',
              },
            ].map((mode, i) => (
              <div key={i} className={`premium-card relative ${mode.featured ? 'ring-2 ring-empire-gold' : ''}`}>
                {mode.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 badge-gold">
                    ⭐ MOST POPULAR
                  </div>
                )}
                <mode.icon className={`w-12 h-12 mb-4 text-empire-${mode.color}`} />
                <h3 className="text-2xl font-display font-bold mb-2">{mode.title}</h3>
                <p className="text-gray-400">{mode.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-empire-charcoal/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge-purple mb-4 inline-flex">How It Works</div>
            <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">
              From Idea to <span className="gradient-text">Empire</span>
            </h2>
            <p className="text-xl text-gray-400">In 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Enter Your Topic', desc: 'Tell us your niche or video idea in any language' },
              { step: '02', title: 'Choose Strategy', desc: 'Select from 5 powerful modes based on your goal' },
              { step: '03', title: 'Get Empire Plan', desc: 'Receive a complete production-ready strategy in seconds' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-7xl font-display font-black gradient-text mb-4">{item.step}</div>
                <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <PricingSection />

      {/* CTA SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center glass-card p-12">
          <Crown className="w-16 h-16 text-empire-gold mx-auto mb-6 animate-float" />
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Ready to Build Your <span className="gradient-text">Empire?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join thousands of creators using AI to dominate their niche
          </p>
          <Link href="/signup" className="glow-button inline-flex items-center gap-2 text-lg">
            Start Building Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
