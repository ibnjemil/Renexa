import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Invention {
  id: string;
  title: string;
  inventor_name: string;
  inventor_id: string;
  location: string;
  thumbnail: string;
  gallery: string[];
  video_url: string;
  explanation: string;
  use_case: string;
  industrial_application: string;
  prototype_date: string;
  patent_status: "pending" | "filed" | "granted" | "none";
  milestone: string;
  velocity_score: number;
  feasibility_rating: number;
  rating_count: number;
  verified: boolean;
  global_priority: boolean;
  fraud_flag: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

export function useInventions(options?: { all?: boolean; userId?: string }) {
  const [inventions, setInventions] = useState<Invention[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInventions = useCallback(async () => {
    setLoading(true);
    let query = supabase.from("inventions").select("*");

    if (options?.userId) {
      query = query.eq("inventor_id", options.userId);
    }

    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (!error && data) {
      setInventions(data.map(d => ({
        ...d,
        gallery: d.gallery || [],
        video_url: d.video_url || "",
        location: d.location || "",
        thumbnail: d.thumbnail || "",
        industrial_application: d.industrial_application || "",
        prototype_date: d.prototype_date || "",
        milestone: d.milestone || "",
      })) as Invention[]);
    }
    setLoading(false);
  }, [options?.userId]);

  useEffect(() => {
    fetchInventions();
  }, [fetchInventions]);

  return { inventions, loading, refetch: fetchInventions };
}

export function useInvention(id: string | undefined) {
  const [invention, setInvention] = useState<Invention | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("inventions")
        .select("*")
        .eq("id", id)
        .single();
      if (data) {
        setInvention({
          ...data,
          gallery: data.gallery || [],
          video_url: data.video_url || "",
          location: data.location || "",
          thumbnail: data.thumbnail || "",
          industrial_application: data.industrial_application || "",
          prototype_date: data.prototype_date || "",
          milestone: data.milestone || "",
        } as Invention);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  return { invention, loading };
}
