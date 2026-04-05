import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Flame, Brain, Users, ArrowRight, Zap, Star, MessageCircle, TrendingUp, Lightbulb, Image, Heart, Send } from "lucide-react";

interface FeatureBlockProps {
  index: number;
  icon: React.ReactNode;
  badge: string;
  title: string;
  titleGradient: string;
  description: string;
  features: { icon: React.ReactNode; title: string; desc: string }[];
  cta: string;
  ctaPath: string;
  reversed?: boolean;
}

function FeatureBlock({ index, icon, badge, title, titleGradient, description, features, cta, ctaPath, reversed }: FeatureBlockProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();

  return (
    <div ref={ref} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${reversed ? "lg:direction-rtl" : ""}`}>
      {/* Text side */}
      <motion.div
        initial={{ opacity: 0, x: reversed ? 40 : -40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
        className={`space-y-6 ${reversed ? "lg:order-2 lg:direction-ltr" : ""}`}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
          {icon}
          <span className="text-[10px] font-display tracking-[0.2em] text-primary">{badge}</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight leading-tight">
          {title}{" "}
          <span className="text-gradient">{titleGradient}</span>
        </h2>

        <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-md">
          {description}
        </p>

        <button
          onClick={() => navigate(ctaPath)}
          className="group inline-flex items-center gap-2 text-primary text-sm font-semibold hover:underline"
        >
          {cta}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      {/* Feature cards side */}
      <motion.div
        initial={{ opacity: 0, x: reversed ? -40 : 40 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.25 }}
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 ${reversed ? "lg:order-1 lg:direction-ltr" : ""}`}
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35 + i * 0.1 }}
            className="group p-5 rounded-2xl border border-border bg-card hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/15 transition-colors">
              {f.icon}
            </div>
            <h4 className="font-display font-semibold text-sm mb-1">{f.title}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export function FeatureGuide() {
  const sectionRef = useRef(null);
  const sectionInView = useInView(sectionRef, { once: true, margin: "-50px" });

  const blocks: Omit<FeatureBlockProps, "index">[] = [
    {
      icon: <Flame className="w-3.5 h-3.5 text-primary" />,
      badge: "SPARK ARENA",
      title: "Vote on the",
      titleGradient: "Next Big Thing",
      description: "A democratic arena where inventions compete for community attention. Upvote breakthroughs, discover trending innovations, and help shape the future of technology.",
      features: [
        { icon: <TrendingUp className="w-4 h-4 text-primary" />, title: "Velocity Score", desc: "Real-time ranking based on community engagement and expert reviews." },
        { icon: <Star className="w-4 h-4 text-primary" />, title: "Featured Picks", desc: "Curated highlights from admin-verified inventions." },
        { icon: <Zap className="w-4 h-4 text-primary" />, title: "Live Voting", desc: "Cast your vote and watch inventions rise in real-time." },
        { icon: <Lightbulb className="w-4 h-4 text-primary" />, title: "Category Battles", desc: "Head-to-head matchups across BioTech, AI, Energy and more." },
      ],
      cta: "Enter the Arena",
      ctaPath: "/spark-arena",
    },
    {
      icon: <Brain className="w-3.5 h-3.5 text-primary" />,
      badge: "AI BRAINSTORM",
      title: "Brainstorm with",
      titleGradient: "Artificial Intelligence",
      description: "Got a spark of an idea? Our AI assistant helps you refine concepts, explore feasibility, and discover use cases you never imagined. 10 free prompts per session.",
      features: [
        { icon: <Lightbulb className="w-4 h-4 text-primary" />, title: "Idea Refinement", desc: "Transform rough concepts into structured invention proposals." },
        { icon: <Zap className="w-4 h-4 text-primary" />, title: "Feasibility Check", desc: "AI analyzes technical and market feasibility in seconds." },
        { icon: <TrendingUp className="w-4 h-4 text-primary" />, title: "Use Case Discovery", desc: "Uncover unexpected applications for your invention." },
        { icon: <Star className="w-4 h-4 text-primary" />, title: "Smart Suggestions", desc: "Get AI-powered next steps and improvement ideas." },
      ],
      cta: "Start Brainstorming",
      ctaPath: "/brainstorm",
      reversed: true,
    },
    {
      icon: <Users className="w-3.5 h-3.5 text-primary" />,
      badge: "INVENTOR CLUB",
      title: "Join the Inventor",
      titleGradient: "Community",
      description: "An Instagram-style social platform for inventors. Share your journey, follow creators, exchange ideas through DMs, and build your inventor network.",
      features: [
        { icon: <Image className="w-4 h-4 text-primary" />, title: "Share & Inspire", desc: "Post photos, videos, and reels of your invention journey." },
        { icon: <Heart className="w-4 h-4 text-primary" />, title: "Engage & Connect", desc: "Like, comment, and follow your favorite inventors." },
        { icon: <Send className="w-4 h-4 text-primary" />, title: "Direct Messages", desc: "Private conversations with fellow inventors in real-time." },
        { icon: <MessageCircle className="w-4 h-4 text-primary" />, title: "Community Feed", desc: "Stay updated with the latest from the inventor world." },
      ],
      cta: "Join the Club",
      ctaPath: "/inventor-club",
    },
  ];

  return (
    <section ref={sectionRef} className="py-24 md:py-32">
      <div className="container space-y-8 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={sectionInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            Everything You Need to{" "}
            <span className="text-gradient">Innovate</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Three powerful tools designed to take your invention from concept to reality.
          </p>
        </motion.div>
      </div>

      <div className="container space-y-28 md:space-y-36">
        {blocks.map((block, i) => (
          <FeatureBlock key={block.badge} index={i} {...block} />
        ))}
      </div>
    </section>
  );
}
