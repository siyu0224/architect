import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getProjects } from "@/app/data/projects";
import { COURTYARD_HOUSE_SLUG, courtyardHouseGallery } from "./gallery";

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
  const gallery = slug === COURTYARD_HOUSE_SLUG ? courtyardHouseGallery : [];

  return (
    <div className="pt-16">
      <article className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-14">
        <Link
          href="/#work"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-[var(--gao-red)]"
        >
          ← Back to work
        </Link>

        <header className="grid gap-8 border-t border-stone-200 pt-8 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--gao-red)]">
              {project.category}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 md:text-5xl">
              {project.title}
            </h1>
          </div>
          <div className="md:col-span-4 md:text-right">
            {project.location && (
              <p className="text-sm text-stone-600">{project.location}</p>
            )}
            <p className="mt-1 text-sm text-stone-500">
              Photography / drawings available upon request
            </p>
          </div>
        </header>

        {/* Hero image */}
        <div className="mt-10 overflow-hidden rounded-lg bg-stone-200">
          <div className="relative aspect-[16/9] md:aspect-[21/9]">
            <Image
              src={(gallery[0]?.src ?? project.image) as string}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
          </div>
        </div>

        {/* Editorial description + gallery */}
        <section className="mt-12 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="sticky top-24 space-y-5">
              <h2 className="text-sm font-semibold tracking-tight text-stone-900">
                Overview
              </h2>
              <p className="text-sm leading-6 text-stone-600">
                {project.description ??
                  "A calm, light-filled residence organized around a courtyard. Clean planes, warm wood, and generous glazing create a quiet backdrop for daily life."}
              </p>
              <div className="space-y-1 text-sm text-stone-600">
                <p>
                  <span className="text-stone-500">Type</span>: Residential
                </p>
                <p>
                  <span className="text-stone-500">Focus</span>: Light • Courtyard • Materiality
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-8">
            {gallery.length > 0 ? (
              <div className="space-y-10">
                {gallery.map((img, idx) => (
                  <figure key={img.src} className="space-y-3">
                    <div className="relative overflow-hidden rounded-lg bg-stone-100">
                      <Image
                        src={img.src}
                        alt={img.alt}
                        width={1800}
                        height={1200}
                        sizes="(max-width: 768px) 100vw, 66vw"
                        className="h-auto w-full object-cover"
                        priority={idx < 2}
                      />
                    </div>
                    <figcaption className="text-xs text-stone-500">
                      {img.alt}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-stone-200 bg-white p-6">
                <p className="text-stone-600">
                  This project doesn’t have a gallery yet. Add images for this
                  slug in `app/work/[slug]/gallery.ts`.
                </p>
              </div>
            )}
          </div>
        </section>
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
