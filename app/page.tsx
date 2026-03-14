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
    <div className="overflow-hidden">
      <section className="relative min-h-screen">
        <HeroSlideshow />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,240,226,0.2),transparent_30%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl items-end px-6 pb-14 pt-32 md:px-10 md:pb-20">
          <div className="grid w-full gap-10 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <FadeUp>
              <div className="max-w-4xl">
                <p className="mb-5 text-[11px] uppercase tracking-[0.42em] text-white/70">
                  Architecture Studio
                </p>
                <h1 className="max-w-3xl text-5xl leading-[0.95] text-white md:text-7xl lg:text-[96px]">
                  Homes shaped by light, site, and quiet detail.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/78 md:text-lg">
                  Gao Architect creates warm, finely considered spaces with a calm
                  material palette and a strong sense of place.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="#work"
                    className="rounded-full bg-white px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-stone-900 transition hover:bg-stone-100"
                  >
                    View Work
                  </Link>
                  <Link
                    href="#contact"
                    className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    Start a Project
                  </Link>
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={0.12}>
              <div className="ml-auto grid max-w-sm gap-4">
                <div className="rounded-[32px] border border-white/15 bg-white/10 p-6 text-white shadow-[0_18px_50px_rgba(18,11,8,0.18)] backdrop-blur-md">
                  <p className="text-[10px] uppercase tracking-[0.35em] text-white/60">
                    Approach
                  </p>
                  <p className="mt-4 text-2xl leading-tight">
                    Contemporary architecture with an intimate, lived-in feel.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "12+", label: "Years shaping homes" },
                    { value: "3", label: "Core studio principles" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[28px] border border-white/15 bg-black/10 p-5 text-white backdrop-blur-md"
                    >
                      <p className="text-3xl">{item.value}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/65">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <section className="relative py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <FadeUp>
              <div className="max-w-3xl">
                <p className="mb-5 text-[11px] uppercase tracking-[0.38em] text-stone-400">
                  Design Ethos
                </p>
                <h2
                  className="text-3xl text-stone-900 md:text-5xl"
                  style={{
                    fontFamily: "var(--font-serif), Georgia, serif",
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  Gao Architect designs spaces that feel grounded, luminous, and
                  deeply connected to daily life.
                </h2>
              </div>
            </FadeUp>
            <FadeUp delay={0.12}>
              <div className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--surface)] p-8 shadow-[0_20px_60px_rgba(66,49,33,0.06)]">
                <p className="text-base leading-8 text-stone-600">
                  Each project balances clarity and warmth through careful siting,
                  natural light, tactile materials, and rooms that unfold with ease.
                  The result is architecture that feels calm on first impression and
                  richer over time.
                </p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <section id="work" className="py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <FadeUp>
              <div>
                <p className="mb-4 text-[11px] uppercase tracking-[0.38em] text-stone-400">
                  Selected Work
                </p>
                <h2 className="max-w-2xl text-4xl text-stone-900 md:text-6xl">
                  Recent homes and spaces with a quiet architectural presence.
                </h2>
              </div>
            </FadeUp>
            <FadeUp delay={0.12}>
              <p className="max-w-md text-sm leading-7 text-stone-500 md:text-base">
                A small collection of projects that reflect the studio’s interest in
                light, sequence, and enduring material character.
              </p>
            </FadeUp>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <ProjectCard key={project.id} project={project} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-14 max-w-3xl pb-8">
            <FadeUp>
              <p className="mb-4 text-[11px] uppercase tracking-[0.35em] text-stone-400">
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
                <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-[0_18px_45px_rgba(66,49,33,0.05)]">
                  <p className="mb-4 text-[10px] uppercase tracking-[0.35em] text-[color:var(--accent)]">
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

      <section id="studio" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
            <FadeUp>
              <p className="mb-6 text-[11px] uppercase tracking-[0.35em] text-stone-400">
                Studio
              </p>
              <h2 className="text-3xl text-stone-900 md:text-5xl">
                Architecture rooted in deep listening and site sensitivity.
              </h2>
              <p className="mt-8 leading-relaxed text-stone-500">
                We approach each project with deep listening and a clear vision.
                Our work is rooted in site sensitivity, thoughtful materiality,
                and lasting relationships with clients and collaborators.
              </p>
              <p className="mt-4 leading-relaxed text-stone-500">
                Whether residential, commercial, or interior-focused, we aim to
                create spaces that feel both intentional and at ease in their
                context.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                {["Site-led", "Materially warm", "Carefully detailed"].map((item) => (
                  <div
                    key={item}
                    className="rounded-full border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-center text-[11px] uppercase tracking-[0.24em] text-stone-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="overflow-hidden rounded-[36px] border border-[color:var(--border)] bg-[color:var(--surface)] p-3 shadow-[0_24px_60px_rgba(66,49,33,0.08)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                  alt="Studio"
                  className="aspect-[4/3] w-full rounded-[28px] object-cover"
                />
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
            <FadeUp>
              <p className="mb-6 text-[11px] uppercase tracking-[0.35em] text-stone-400">
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
              <div className="mt-10 space-y-4 rounded-[28px] border border-[color:var(--border)] bg-[color:var(--surface)] p-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400">
                  Helpful to include
                </p>
                <p className="text-sm text-stone-500">
                  Location, project type, approximate schedule, and any early plans,
                  images, or thoughts.
                </p>
                <a
                  href="mailto:liusiyu0224@gmail.com"
                  className="inline-block pt-2 text-sm text-stone-900 underline underline-offset-4 transition-colors hover:text-[color:var(--accent)]"
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
