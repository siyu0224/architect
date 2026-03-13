import Link from "next/link";
import { getProjects } from "@/app/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { ContactForm } from "@/components/ContactForm";
import { FadeUp } from "@/components/FadeUp";
import { HeroSlideshow } from "@/components/HeroSlideshow";

export default async function Home() {
  const projects = await getProjects();
  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen">
        <HeroSlideshow />
        <div className="absolute bottom-12 left-0 right-0 px-6 md:px-10 max-w-7xl mx-auto">
          <FadeUp delay={0.2}>
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-light text-white leading-tight"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              Spaces that sit<br />gracefully in<br />their place.
            </h1>
          </FadeUp>
        </div>
      </section>

      {/* Work */}
      <section id="work" className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <FadeUp>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-12">Selected Work</p>
          </FadeUp>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Studio */}
      <section id="studio" className="border-t border-stone-100 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-16 md:grid-cols-2 md:gap-24">
            <FadeUp>
              <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-8">Studio</p>
              <h2
                className="text-3xl md:text-4xl font-light text-stone-900 leading-snug"
                style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
              >
                Architecture rooted in deep listening and site sensitivity.
              </h2>
              <p className="mt-8 text-stone-500 leading-relaxed">
                We approach each project with deep listening and a clear vision.
                Our work is rooted in site sensitivity, thoughtful materiality,
                and lasting relationships with clients and collaborators.
              </p>
              <p className="mt-4 text-stone-500 leading-relaxed">
                Whether residential, commercial, or interior-focused, we aim to
                create spaces that feel both intentional and at ease in their
                context.
              </p>
            </FadeUp>
            <FadeUp delay={0.15}>
              <div className="aspect-[4/3] overflow-hidden bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                  alt="Studio"
                  className="object-cover w-full h-full"
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="border-t border-stone-100 py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-16 lg:grid-cols-5">
            <FadeUp className="lg:col-span-2">
              <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-8">Contact</p>
              <h2
                className="text-3xl md:text-4xl font-light text-stone-900"
                style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
              >
                Start a conversation.
              </h2>
              <p className="mt-6 text-stone-500 leading-relaxed">
                Have a project in mind? We'd love to hear about your site, vision,
                timeline, and goals.
              </p>
              <div className="mt-8">
                <a
                  href="mailto:liusiyu0224@gmail.com"
                  className="text-sm text-stone-900 hover:text-stone-500 transition-colors underline underline-offset-4"
                >
                  liusiyu0224@gmail.com
                </a>
              </div>
            </FadeUp>
            <FadeUp delay={0.15} className="lg:col-span-3">
              <ContactForm />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-8">
        <div className="mx-auto max-w-7xl px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-400">© {new Date().getFullYear()} Gao Architect</p>
          <div className="flex gap-8">
            <Link href="#work" className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-800">
              Work
            </Link>
            <Link href="#studio" className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-800">
              Studio
            </Link>
            <Link href="#contact" className="text-[10px] uppercase tracking-widest text-stone-400 hover:text-stone-800">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
