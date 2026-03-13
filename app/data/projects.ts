import { createClient } from "@/lib/supabase/server";

export interface Project {
  id: string;
  title: string;
  category: string;
  location: string | null;
  image: string;
  slug: string;
  description: string | null;
}

/** Static fallback when Supabase is not configured */
const staticProjects: Project[] = [
  { id: "1", title: "Residence One", category: "Residential", location: "California", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80", slug: "residence-one", description: null },
  { id: "2", title: "Hill House", category: "Residential", location: "Pacific Northwest", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80", slug: "hill-house", description: null },
  { id: "3", title: "Urban Pavilion", category: "Commercial", location: "San Francisco", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80", slug: "urban-pavilion", description: null },
  { id: "4", title: "Coastal Retreat", category: "Residential", location: "Oregon Coast", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80", slug: "coastal-retreat", description: null },
  { id: "5", title: "Garden Studio", category: "Studio", location: "Bay Area", image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80", slug: "garden-studio", description: null },
  { id: "6", title: "Canyon View", category: "Residential", location: "Arizona", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80", slug: "canyon-view", description: null },
];

export async function getProjects(): Promise<Project[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return staticProjects;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, category, location, image, slug, description")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) return data as Project[];
  } catch {
    // fallback to static
  }
  return staticProjects;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug) ?? null;
}
