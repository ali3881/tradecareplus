export default function LandingVideo() {
  return (
    <section className="bg-[#f6f2e8] px-4 py-16 sm:py-20">
      <div className="mx-auto grid max-w-[1280px] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="max-w-[520px]">
          <span className="inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-black/70">
            Project Spotlight
          </span>

          <h2 className="mt-5 font-alt text-4xl font-semibold leading-tight text-[#1f1f1f] sm:text-5xl">
            See the finish, flow, and detail behind our residential work
          </h2>

          <p className="mt-5 text-base leading-7 text-black/70 sm:text-lg">
            A short walkthrough of a completed home project, highlighting clean
            exterior lines, open living spaces, and the quality of the final
            finish. It gives visitors a stronger feel for the standard of work
            TradeCare Plus delivers across modern residential projects.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-black/35 to-transparent" />

          <video
            className="aspect-[9/16] max-h-[720px] w-full bg-black object-cover"
            controls
            playsInline
            preload="none"
            poster="/videos/add-poster.jpg"
          >
            <source src="/videos/add.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
}
