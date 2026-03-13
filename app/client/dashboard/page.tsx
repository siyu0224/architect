import Link from "next/link";
import { Logo } from "@/components/Logo";
import { currentUser } from "@clerk/nextjs/server";
import { SignOutButton } from "@/components/SignOutButton";

const phases = [
  "Pre-design",
  "Schematic Design",
  "Design Development",
  "Construction Documents",
  "Construction Admin",
];

const projects = [
  {
    id: "courtyard-house",
    name: "Courtyard House",
    location: "Palo Alto, California",
    type: "Residential",
    phase: 2,
    images: [
      "/projects/courtyard-house/ext-front-far.jpg",
      "/projects/courtyard-house/int-living-room.jpg",
      "/projects/courtyard-house/int-kitchen.jpg",
    ],
    nextMilestone: "Design Development review",
    nextDate: "Apr 10, 2026",
    started: "January 2026",
    unread: 2,
  },
];

export default async function ClientDashboard() {
  const user = await currentUser();
  const firstName = user?.firstName ?? "there";
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-100 bg-white sticky top-0 z-10">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-7 w-7" />
            <span className="text-xs font-light tracking-[0.25em] uppercase text-stone-900">
              Gao Architect
            </span>
          </Link>
          <div className="flex items-center gap-8">
            <span className="hidden md:block text-xs text-stone-400 tracking-wide">
              {user?.firstName} {user?.lastName}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-5xl px-6 md:px-10 py-20">

        {/* Welcome heading */}
        <div className="mb-16">
          <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400 mb-4">
            Client Portal
          </p>
          <h1
            className="text-4xl md:text-5xl text-stone-900 leading-tight"
            style={{ fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: "-0.02em" }}
          >
            Good to see you,<br />{firstName}.
          </h1>
        </div>

        {/* Section label */}
        <div className="flex items-center justify-between border-t border-stone-100 pt-8 mb-10">
          <p className="text-[10px] uppercase tracking-[0.35em] text-stone-400">
            Your projects ({projects.length})
          </p>
        </div>

        {/* Project cards */}
        <div className="space-y-px">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/client/projects/${project.id}`}
              className="group flex flex-col md:flex-row border border-stone-100 hover:border-stone-200 transition-colors overflow-hidden"
            >
              {/* Image strip — 3 images side by side */}
              <div className="md:w-[42%] flex overflow-hidden">
                {project.images.map((src, i) => (
                  <div
                    key={src}
                    className="flex-1 overflow-hidden"
                    style={{ aspectRatio: i === 0 ? "3/4" : "3/4" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>
                ))}
              </div>

              {/* Info panel */}
              <div className="flex-1 flex flex-col justify-between p-8 md:p-10">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 mb-3">
                    {project.type} · {project.location}
                  </p>
                  <h2
                    className="text-3xl text-stone-900 mb-8"
                    style={{ fontFamily: "Georgia, serif", fontWeight: 400, letterSpacing: "-0.01em" }}
                  >
                    {project.name}
                  </h2>

                  {/* Phase bar */}
                  <div className="mb-6">
                    <div className="flex gap-1 mb-3">
                      {phases.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-0.5 flex-1 transition-colors ${
                            idx < project.phase
                              ? "bg-stone-900"
                              : idx === project.phase
                              ? "bg-[var(--gao-red)]"
                              : "bg-stone-100"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-stone-500">
                      <span className="font-medium text-stone-900">
                        {phases[project.phase]}
                      </span>
                      <span className="text-stone-300 mx-2">·</span>
                      Phase {project.phase + 1} of {phases.length}
                    </p>
                  </div>
                </div>

                <div className="border-t border-stone-50 pt-7 flex items-end justify-between">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 mb-1">
                        Next milestone
                      </p>
                      <p className="text-sm text-stone-900">{project.nextMilestone}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{project.nextDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-stone-400 mb-1">
                        Project started
                      </p>
                      <p className="text-xs text-stone-500">{project.started}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {project.unread > 0 && (
                      <span className="text-[10px] uppercase tracking-widest text-[var(--gao-red)]">
                        {project.unread} new
                      </span>
                    )}
                    <span className="text-[10px] uppercase tracking-[0.25em] text-stone-400 group-hover:text-stone-900 transition-colors">
                      Open →
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 border-t border-stone-100 pt-12 text-center">
          <p className="text-sm text-stone-400 mb-6">Have a new project in mind?</p>
          <a
            href="mailto:liusiyu0224@gmail.com"
            className="text-[10px] uppercase tracking-[0.3em] text-stone-900 border-b border-stone-300 pb-0.5 hover:border-stone-900 transition-colors"
          >
            Get in touch with Gao →
          </a>
        </div>
      </main>

      <footer className="border-t border-stone-100 py-6 mt-8">
        <div className="mx-auto max-w-5xl px-6 md:px-10 flex items-center justify-between">
          <p className="text-xs text-stone-300">© {new Date().getFullYear()} Gao Architect</p>
          <Link href="/" className="text-[10px] uppercase tracking-[0.25em] text-stone-300 hover:text-stone-500 transition-colors">
            Main site
          </Link>
        </div>
      </footer>
    </div>
  );
}
