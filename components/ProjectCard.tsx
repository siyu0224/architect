import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/app/data/projects";

function projectLocation(project: Project): string | undefined {
  return project.location ?? undefined;
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group block overflow-hidden rounded-lg bg-stone-200 focus:outline-none focus:ring-2 focus:ring-[var(--gao-red)] focus:ring-offset-2"
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="bg-[var(--background)] px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--gao-red)]">
          {project.category}
        </p>
        <h3 className="mt-0.5 font-semibold text-stone-900 group-hover:text-[var(--gao-red)] transition-colors">
          {project.title}
        </h3>
        {projectLocation(project) && (
          <p className="text-sm text-stone-500">{projectLocation(project)}</p>
        )}
      </div>
    </Link>
  );
}
