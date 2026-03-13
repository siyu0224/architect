import Link from "next/link";
import type { Project } from "@/app/data/projects";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/work/${project.slug}`} className="group block overflow-hidden">
      <div className="relative overflow-hidden bg-stone-100" style={{ aspectRatio: "4/3" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={project.title}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100">
          <p className="text-[10px] uppercase tracking-widest text-white/70">{project.category}</p>
          <h3 className="text-white text-xl mt-1" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
            {project.title}
          </h3>
          {project.location && (
            <p className="text-sm text-white/60 mt-0.5">{project.location}</p>
          )}
        </div>
      </div>
      <div className="pt-3">
        <p className="text-[10px] uppercase tracking-widest text-stone-400">{project.category}</p>
        <h3 className="mt-0.5 text-stone-900" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
          {project.title}
        </h3>
        {project.location && (
          <p className="text-xs text-stone-400 mt-0.5">{project.location}</p>
        )}
      </div>
    </Link>
  );
}
