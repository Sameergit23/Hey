'use client';

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '@/animations/stagger';
import { Hash, Zap, Users, Star, TrendingUp } from 'lucide-react';

const communities = [
  { id: 1, name: 'Design & Dev', emoji: '🎨', members: 12400, description: 'UI/UX, code and creativity', color: 'from-violet-500 to-purple-600' },
  { id: 2, name: 'Gaming Hub', emoji: '🎮', members: 45200, description: 'All things gaming', color: 'from-blue-500 to-cyan-500' },
  { id: 3, name: 'Music Vibes', emoji: '🎧', members: 8900, description: 'Share what you\'re listening to', color: 'from-pink-500 to-rose-500' },
  { id: 4, name: 'Night Owls', emoji: '🌙', members: 6700, description: 'Late night crew', color: 'from-indigo-500 to-blue-600' },
  { id: 5, name: 'Travelers ✈️', emoji: '✈️', members: 22100, description: 'Share your adventures', color: 'from-amber-500 to-orange-500' },
  { id: 6, name: 'Book Club', emoji: '📚', members: 4300, description: 'Readers unite!', color: 'from-emerald-500 to-teal-500' },
];

const trending = ['#aesthetic', '#vibe', '#buildInPublic', '#LoFi', '#nightowls', '#coding'];

export default function ExploreView() {
  return (
    <div className="flex flex-col flex-1 h-full bg-light-bg dark:bg-dark-bg overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-8 pb-4 bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text font-display">Explore</h1>
        <p className="text-sm text-light-muted dark:text-dark-muted mt-0.5">Discover communities & channels</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Featured */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            <p className="text-sm font-semibold text-light-text dark:text-dark-text">Featured</p>
          </div>
          <motion.div
            className="bg-gradient-brand rounded-3xl p-5 text-white relative overflow-hidden cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <div className="relative z-10">
              <span className="text-4xl mb-3 block">🚀</span>
              <h3 className="text-xl font-bold font-display">Hey Official</h3>
              <p className="text-white/70 text-sm mt-1">Updates, tips & the Hey community</p>
              <div className="flex items-center gap-1.5 mt-3">
                <Users className="w-3.5 h-3.5 text-white/70" />
                <span className="text-white/70 text-xs">1.2M members</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Trending */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-light-text dark:text-dark-text">Trending Topics</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {trending.map(tag => (
              <motion.button
                key={tag}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-colors"
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </section>

        {/* Communities */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-light-text dark:text-dark-text">Communities</p>
          </div>
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {communities.map(comm => (
              <motion.div
                key={comm.id}
                variants={staggerItem}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 p-4 bg-white dark:bg-dark-surface rounded-2xl shadow-card-light dark:shadow-card-dark cursor-pointer border border-transparent hover:border-primary/20 transition-all"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${comm.color} rounded-2xl flex items-center justify-center text-2xl shrink-0`}>
                  {comm.emoji}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-light-text dark:text-dark-text truncate">{comm.name}</p>
                  <p className="text-xs text-light-muted dark:text-dark-muted truncate">{comm.description}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3 text-primary" />
                    <span className="text-xs text-primary">{comm.members.toLocaleString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </div>
    </div>
  );
}
