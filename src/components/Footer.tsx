import { useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src={logo} alt="Renex" className="w-8 h-8 rounded-lg object-contain" />
              <span className="font-display font-bold text-sm">Renex</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Bridging the gap between visionary inventors and industry leaders looking for the next big breakthrough.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Platform</h4>
            <div className="space-y-2">
              <button onClick={() => navigate("/browse")} className="block text-sm text-foreground hover:text-primary transition-colors">Browse Inventions</button>
              <button onClick={() => navigate("/spark-arena")} className="block text-sm text-foreground hover:text-primary transition-colors">Spark Arena</button>
              <button onClick={() => navigate("/brainstorm")} className="block text-sm text-foreground hover:text-primary transition-colors">AI Brainstorm</button>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Legal</h4>
            <div className="space-y-2">
              <span className="block text-sm text-foreground">Privacy Policy</span>
              <span className="block text-sm text-foreground">Terms of Service</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>© 2026 Renex. All rights reserved.</span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            Built with <Heart className="w-3 h-3 text-destructive fill-destructive" /> on Replit
          </span>
        </div>
      </div>
    </footer>
  );
}
