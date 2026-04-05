import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Slow-drifting gradient orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[100px]"
        animate={{
          x: ["-10%", "15%", "-5%", "10%", "-10%"],
          y: ["-5%", "10%", "20%", "5%", "-5%"],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ top: "10%", left: "60%" }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-[120px]"
        animate={{
          x: ["5%", "-10%", "8%", "-15%", "5%"],
          y: ["10%", "-5%", "-10%", "5%", "10%"],
        }}
        transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        style={{ top: "40%", left: "10%" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-primary/[0.02] blur-[80px]"
        animate={{
          x: ["-8%", "12%", "-3%", "8%", "-8%"],
          y: ["15%", "-8%", "5%", "-12%", "15%"],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        style={{ bottom: "10%", right: "20%" }}
      />

      {/* Subtle moving grid lines */}
      <motion.div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "80px 80px"] }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
