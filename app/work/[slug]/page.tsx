import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/app/data/projects";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const allProjects = await getProjects();
  const others = allProjects.filter((p) => p.id !== project.id).slice(0, 3);

  return (
    <div className="pt-16">
      <article className="mx-auto max-w-4xl px-5 py-12 md:px-8 md:py-16">
        <Link
          href="/#work"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-[var(--gao-red)]"
        >
          ← Back to work
        </Link>
        <header className="mb-10">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--gao-red)]">
            {project.category}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 md:text-4xl">
            {project.title}
          </h1>
          {project.location && (
            <p className="mt-2 text-stone-600">{project.location}</p>
          )}
        </header>
        <div className="aspect-video overflow-hidden rounded-lg bg-stone-200">
          <Image
            src={project.image}
            alt={project.title}
            width={1200}
            height={675}
            className="h-full w-full object-cover"
          />
        </div>
        {project.description && (
          <div className="mt-10 prose prose-stone max-w-none">
            <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>
        )}
        {!project.description && (
          <div className="mt-10 prose prose-stone max-w-none">
            <p className="text-stone-600 leading-relaxed">
              Add your project description in Supabase (projects table, description column) or replace this placeholder with real content and more photos.
            </p>
          </div>
        )}
      </article>

      {others.length > 0 && (
        <section className="border-t border-stone-200 bg-stone-50 py-16">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <h2 className="text-xl font-semibold text-stone-900">More projects</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {others.map((p) => (
                <Link
                  key={p.id}
                  href={`/work/${p.slug}`}
                  className="group block overflow-hidden rounded-lg bg-white"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-2 font-medium text-stone-900 group-hover:text-[var(--gao-red)]">
                    {p.title}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
