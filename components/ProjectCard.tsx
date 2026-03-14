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
      <Link href={`/work/${project.slug}`} className="group block">
        <div className="relative overflow-hidden bg-stone-100" style={{ aspectRatio: "4/3" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={project.title}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/15 transition-all duration-500" />
        </div>
        <div className="border-b border-[color:var(--border)] pb-6 pt-5">
          <p className="text-[10px] uppercase tracking-[0.32em] text-stone-400">
            {project.category}
            {project.location ? ` / ${project.location}` : ""}
          </p>
          <h3 className="mt-2 text-[30px] text-stone-900" style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
            {project.title}
          </h3>
          <p className="mt-3 max-w-sm text-sm leading-7 text-stone-500">
            View project details and image gallery.
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
