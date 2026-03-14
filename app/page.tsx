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
      "Each project begins with close attention to the site, the brief, and the way daily life is meant to unfold within the home.",
  },
  {
    title: "Concept",
    body:
      "A strong architectural idea is developed through drawings, conversation, and a careful study of light, proportion, and sequence.",
  },
  {
    title: "Development",
    body:
      "Material expression, detailing, and interior atmosphere are refined into spaces that feel clear, calm, and enduring.",
  },
  {
    title: "Construction",
    body:
      "The project is carried through documentation and coordination with the same level of care that shaped the initial concept.",
  },
];

export default async function Home() {
  const projects = await getProjects();

  return (
    <div className="bg-[color:var(--background)]">
      <section className="relative h-screen">
        <HeroSlideshow />
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:px-10 lg:grid-cols-[1.15fr_0.85fr]">
          <FadeUp>
            <div className="max-w-4xl">
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
            </div>
          </FadeUp>
          <FadeUp delay={0.12}>
            <div className="max-w-xl border-t border-[color:var(--border)] pt-6">
              <p className="text-base leading-8 text-stone-600">
                Gao Architect creates homes that prioritize light, proportion,
                material warmth, and the lived experience of space. The work is
                contemporary in expression and deeply attentive to context.
              </p>
            </div>
          </FadeUp>
        </div>
      </section>

      <section id="work" className="py-8 md:py-14">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <FadeUp>
              <div>
                <p className="mb-4 text-[10px] uppercase tracking-[0.38em] text-stone-400">
                  Selected Work
                </p>
                <h2 className="max-w-3xl text-4xl text-stone-900 md:text-6xl">
                  Residences defined by clarity, stillness, and material depth.
                </h2>
              </div>
            </FadeUp>
            <FadeUp delay={0.12}>
              <p className="max-w-md text-sm leading-7 text-stone-500 md:text-base">
                A curated selection of projects that reflect the studio&apos;s modern
                sensibility and interest in enduring spaces.
              </p>
            </FadeUp>
          </div>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-14 max-w-3xl">
            <FadeUp>
              <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-stone-400">
                Process
              </p>
              <h2 className="text-3xl text-stone-900 md:text-5xl">
                A disciplined process from first conversation to built form.
              </h2>
            </FadeUp>
          </div>

          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step, index) => (
              <FadeUp key={step.title} delay={index * 0.06}>
                <div className="border-t border-[color:var(--border)] pt-5">
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

      <section id="studio" className="border-t border-[color:var(--border)] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <FadeUp>
              <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-stone-400">
                Design Approach
              </p>
              <h2 className="text-3xl text-stone-900 md:text-5xl">
                Rooted in site sensitivity and a measured architectural language.
              </h2>
              <p className="mt-8 leading-relaxed text-stone-500">
                Each project begins with careful listening to the site, the client,
                and the rhythms of everyday life. The goal is to shape spaces that
                feel clear and generous without excess.
              </p>
              <p className="mt-4 leading-relaxed text-stone-500">
                Material restraint, natural light, and precise detailing give the
                work its calm character and enduring sense of value.
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

      <section id="contact" className="border-t border-[color:var(--border)] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
            <FadeUp>
              <p className="mb-6 text-[10px] uppercase tracking-[0.35em] text-stone-400">
                New Projects
              </p>
              <h2 className="text-3xl text-stone-900 md:text-5xl">
                Private residences, renovations, and site-responsive homes.
              </h2>
              <p className="mt-8 max-w-md text-sm leading-7 text-stone-500 md:text-[15px]">
                For new inquiries, it&apos;s helpful to share the site location,
                project scope, timeline, and any early thoughts about how you want
                the home to feel and function.
              </p>
              <div className="mt-10 border-t border-[color:var(--border)] pt-8">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">
                  Contact
                </p>
                <a
                  href="mailto:liusiyu0224@gmail.com"
                  className="mt-4 inline-block text-sm text-stone-900 underline underline-offset-4 transition-colors hover:text-[color:var(--accent)]"
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

      <footer className="py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-[color:var(--border)] px-6 pt-8 md:flex-row md:px-10">
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
