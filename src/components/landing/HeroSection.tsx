import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Animated background grid */}
      <div className="absolute inset-0 industrial-grid opacity-10" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 right-[15%] w-72 h-72 rounded-full bg-primary/5 blur-3xl"
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-[10%] w-96 h-96 rounded-full bg-accent/5 blur-3xl"
        animate={{ y: [0, 20, 0], scale: [1, 0.95, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="container relative py-20 md:py-28 space-y-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-display tracking-wider text-primary">INVENTION MARKETPLACE</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight max-w-4xl leading-[1.05]"
        >
          Where Ideas Become{" "}
          <span className="text-gradient">Reality</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="text-muted-foreground text-base md:text-lg max-w-xl leading-relaxed"
        >
          Connect with brilliant inventors. Explore patents, prototypes, and ideas 
          ready for licensing. Vote, brainstorm with AI, and join the inventor community.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="flex flex-wrap items-center gap-4 pt-2"
        >
          <button
            onClick={() => navigate("/browse")}
            className="group flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            Browse Inventions
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={() => navigate("/brainstorm")}
            className="flex items-center gap-2 border border-border px-7 py-3.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            AI Brainstorm
          </button>
          <button
            onClick={() => navigate("/inventor-club")}
            className="flex items-center gap-2 border border-border px-7 py-3.5 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            Inventor Club
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex items-center gap-8 pt-8"
        >
          {[
            { value: "∞", label: "Inventions" },
            { value: "AI", label: "Brainstorm" },
            { value: "24/7", label: "Community" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl md:text-3xl font-display font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-5 h-8 border-2 border-muted-foreground/30 rounded-full flex justify-center pt-1.5">
          <motion.div
            className="w-1 h-1.5 bg-primary rounded-full"
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
