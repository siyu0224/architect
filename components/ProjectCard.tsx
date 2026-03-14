"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/app/data/projects";

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: (index % 3) * 0.1 }}
    >
      <Link
        href={`/work/${project.slug}`}
        className="group block overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-3 shadow-[0_18px_40px_rgba(69,48,31,0.06)] transition-transform duration-500 hover:-translate-y-1"
      >
        <div className="relative overflow-hidden rounded-[22px] bg-stone-100" style={{ aspectRatio: "4/3" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/5 transition-all duration-500 group-hover:bg-black/20" />
          <div className="absolute bottom-4 left-4 rounded-full border border-white/25 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/90 backdrop-blur-md">
            {project.category}
          </div>
        </div>
        <div className="px-2 pb-2 pt-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-stone-400">{project.location ?? project.category}</p>
          <h3 className="mt-1 text-[28px] text-stone-900" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
            {project.title}
          </h3>
          {project.location && (
            <p className="mt-2 text-sm text-stone-500">View project details and image gallery</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
