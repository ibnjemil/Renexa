import { type Invention } from "@/hooks/useInventions";
import { VelocityBadge } from "./VelocityBadge";
import { MapPin, Star, Shield, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface InventionCardProps {
  invention: Invention;
  featured?: boolean;
}

const patentColors: Record<string, string> = {
  granted: "bg-velocity-high/20 text-velocity-high",
  filed: "bg-primary/20 text-primary",
  pending: "bg-destructive/20 text-destructive",
  none: "bg-muted text-muted-foreground",
};

const patentLabels: Record<string, string> = {
  granted: "Available",
  filed: "Patent Pending",
  pending: "Patent Pending",
  none: "Prototype",
};

export function InventionCard({ invention, featured = false }: InventionCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/invention/${invention.id}`)}
      className="group cursor-pointer rounded-xl overflow-hidden bg-card border border-border card-hover"
    >
      <div className={`relative overflow-hidden bg-muted ${featured ? "h-56" : "h-48"}`}>
        {invention.thumbnail ? (
          <img src={invention.thumbnail} alt={invention.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center industrial-grid">
            <span className="font-display text-muted-foreground text-xs tracking-widest uppercase">
              {invention.category}
            </span>
          </div>
        )}

        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${patentColors[invention.patent_status]}`}>
          {patentLabels[invention.patent_status]}
        </div>

        {invention.verified && (
          <div className="absolute top-3 right-3">
            <Shield className="w-4 h-4 text-accent" />
          </div>
        )}
      </div>

      <div className="p-4 space-y-2.5">
        <div className="flex items-center gap-1.5 text-primary">
          <Tag className="w-3 h-3" />
          <span className="text-xs font-medium">{invention.category}</span>
        </div>

        <h3 className={`font-display font-bold tracking-tight leading-tight ${featured ? "text-lg" : "text-base"}`}>
          {invention.title}
        </h3>

        {featured && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {invention.explanation.substring(0, 120)}...
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="text-xs">{invention.location}</span>
          </div>
          <VelocityBadge score={invention.velocity_score} size="sm" />
        </div>

        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 text-primary fill-primary" />
          <span className="text-xs text-muted-foreground">
            {Number(invention.feasibility_rating).toFixed(1)} ({invention.rating_count})
          </span>
        </div>
      </div>
    </div>
  );
}
