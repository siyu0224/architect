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
      <Link href={`/work/${project.slug}`} className="group block overflow-hidden">
        <div className="relative overflow-hidden bg-stone-100" style={{ aspectRatio: "4/3" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={project.title}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
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
    </motion.div>
  );
}
