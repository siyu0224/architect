import Link from "next/link";
import { getProjects } from "@/app/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { ContactForm } from "@/components/ContactForm";

export default async function Home() {
  const projects = await getProjects();
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex flex-col justify-end pb-12 md:pb-16">
        <div className="absolute inset-0 -z-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero.jpg"
            alt=""
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-stone-900/50" />
        </div>
        <div className="mx-auto w-full max-w-6xl px-5 md:px-8">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white md:text-5xl lg:text-6xl">
            Spaces that sit gracefully in their place.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/90">
            Gao Architect is dedicated to creating architecture and interiors
            that respond to people, site, and light.
          </p>
          <Link
            href="#work"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            View our work
            <span aria-hidden>↓</span>
          </Link>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="border-t border-stone-200 bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                Selected work
              </h2>
              <p className="mt-2 text-stone-600">
                Residential, commercial, and studio projects.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </section>

      {/* Studio */}
      <section id="studio" className="border-t border-stone-200 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                Studio
              </h2>
              <p className="mt-6 text-stone-600 leading-relaxed">
                We approach each project with deep listening and a clear vision.
                Our work is rooted in site sensitivity, thoughtful materiality,
                and lasting relationships with clients and collaborators.
              </p>
              <p className="mt-4 text-stone-600 leading-relaxed">
                Whether residential, commercial, or interior-focused, we aim to
                create spaces that feel both intentional and at ease in their
                context.
              </p>
            </div>
            <div className="rounded-xl bg-stone-100 aspect-[4/3] overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                alt="Studio"
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-stone-200 bg-white py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
                Get in touch
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed">
                Have a project in mind? We’d love to hear about your site, vision,
                timeline, and goals. Send us a message and we’ll get back to you
                shortly.
              </p>
              <div className="mt-8 space-y-2 text-stone-700">
                <p>
                  <a
                    href="mailto:hello@gaoarchitect.com"
                    className="font-medium text-[var(--gao-red)] hover:underline"
                  >
                    hello@gaoarchitect.com
                  </a>
                </p>
                <p className="text-stone-600">
                  Replace with your actual address and phone if desired.
                </p>
              </div>
            </div>
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8">
        <div className="mx-auto max-w-6xl px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-stone-500">© {new Date().getFullYear()} Gao Architect</p>
          <div className="flex gap-6">
            <Link href="#work" className="text-sm text-stone-500 hover:text-stone-800">
              Work
            </Link>
            <Link href="#studio" className="text-sm text-stone-500 hover:text-stone-800">
              Studio
            </Link>
            <Link href="#contact" className="text-sm text-stone-500 hover:text-stone-800">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
