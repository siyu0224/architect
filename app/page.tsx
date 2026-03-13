import Link from "next/link";
import { getProjects } from "@/app/data/projects";
import { ProjectCard } from "@/components/ProjectCard";
import { ContactForm } from "@/components/ContactForm";
import { FadeUp } from "@/components/FadeUp";
import { HeroSlideshow } from "@/components/HeroSlideshow";

const processSteps = [
  {
    title: "Discovery",
    body:
      "Each project begins with careful listening: to the site, to the brief, and to the life a home is meant to support.",
  },
  {
    title: "Vision",
    body:
      "A clear architectural idea emerges through drawings, precedents, and conversation, giving the project a calm center.",
  },
  {
    title: "Development",
    body:
      "Materiality, light, proportion, and sequence are refined into spaces that feel measured, lasting, and lived in.",
  },
  {
    title: "Construction",
    body:
      "Through documentation, coordination, and site involvement, the design is carried carefully from concept into built form.",
  },
];

export default async function Home() {
  const projects = await getProjects();

  return (
    <div className="bg-white">
      <section className="relative h-screen">
        <HeroSlideshow />
      </section>

      <section className="border-b border-stone-100 py-24 md:py-36">
        <div className="mx-auto max-w-5xl px-6 md:px-10">
          <FadeUp>
            <h1
              className="text-2xl text-stone-900 md:text-3xl lg:text-4xl"
              style={{
                fontFamily: "var(--font-serif), Georgia, serif",
                letterSpacing: "-0.01em",
                lineHeight: 1.3,
              }}
            >
              Gao Architect is dedicated to creating spaces that sit gracefully and
              lightly in their place.
            </h1>
          </FadeUp>
        </div>
      </section>

      <section id="work" className="py-20 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <FadeUp>
            <p className="mb-12 text-[10px] uppercase tracking-widest text-stone-400">
              Selected Work
            </p>
          </FadeUp>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-14 max-w-3xl border-b border-stone-100 pb-8">
            <FadeUp>
              <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-stone-400">
                Process
              </p>
              <h2 className="text-3xl text-stone-900 md:text-5xl">
                A measured process from first conversation to built work.
              </h2>
            </FadeUp>
          </div>

          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step, index) => (
              <FadeUp key={step.title} delay={index * 0.06}>
                <div className="border-t border-stone-200 pt-5">
                  <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-stone-400">
                    0{index + 1}
                  </p>
                  <h3 className="text-2xl text-stone-900 md:text-[32px]">
                    {step.title}
                  </h3>
                  <p className="mt-5 max-w-sm text-sm leading-7 text-stone-500">
                    {step.body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section id="studio" className="border-t border-stone-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-16 md:grid-cols-2 md:gap-24">
            <FadeUp>
              <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-stone-400">
                Studio
              </p>
              <h2 className="text-3xl text-stone-900 md:text-5xl">
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
              <div className="overflow-hidden bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                  alt="Studio"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <section id="contact" className="border-t border-stone-100 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
            <FadeUp>
              <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-stone-400">
                New Projects
              </p>
              <h2 className="text-3xl text-stone-900 md:text-5xl">
                For homes, renovations, and early site conversations.
              </h2>
              <p className="mt-8 max-w-md text-sm leading-7 text-stone-500 md:text-[15px]">
                If you are considering a residential project, we would love to hear
                about the site, the scope of work, your timeline, and the way you
                hope to live in the finished space.
              </p>
              <div className="mt-10 space-y-4 border-t border-stone-100 pt-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">
                  Helpful to include
                </p>
                <p className="text-sm text-stone-500">
                  Location, project type, approximate schedule, and any early plans,
                  images, or thoughts.
                </p>
                <a
                  href="mailto:liusiyu0224@gmail.com"
                  className="inline-block pt-2 text-sm text-stone-900 underline underline-offset-4 transition-colors hover:text-stone-500"
                >
                  liusiyu0224@gmail.com
                </a>
              </div>
            </FadeUp>

            <FadeUp delay={0.12}>
              <ContactForm />
            </FadeUp>
          </div>
        </div>
      </section>

      <footer className="border-t border-stone-100 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row md:px-10">
          <p className="text-xs text-stone-400">© {new Date().getFullYear()} Gao Architect</p>
          <div className="flex gap-8">
            <Link
              href="#work"
              className="text-[10px] uppercase tracking-[0.3em] text-stone-400 hover:text-stone-800"
            >
              Work
            </Link>
            <Link
              href="#studio"
              className="text-[10px] uppercase tracking-[0.3em] text-stone-400 hover:text-stone-800"
            >
              Studio
            </Link>
            <Link
              href="#contact"
              className="text-[10px] uppercase tracking-[0.3em] text-stone-400 hover:text-stone-800"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
