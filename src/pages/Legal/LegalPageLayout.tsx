import type { ReactNode } from "react";

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
};

export default function LegalPageLayout({
  eyebrow,
  title,
  intro,
  children,
}: LegalPageLayoutProps) {
  return (
    <main className="bg-ivory text-ink">
      <header className="border-b border-line">
        <div className="container py-16 md:py-24 lg:py-28">
          <p className="text-label font-medium uppercase tracking-[0.2em] text-ochre">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl font-display text-display-l leading-[0.98]">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-body-l leading-relaxed text-muted">
            {intro}
          </p>
        </div>
      </header>

      <div className="container py-14 md:py-20">
        <div className="mx-auto max-w-reading">
          <div className="space-y-12 md:space-y-14">{children}</div>
        </div>
      </div>
    </main>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}>
      <h2
        id={title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
        className="font-display text-heading-s leading-tight"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-body-s leading-[1.8] text-muted">
        {children}
      </div>
    </section>
  );
}
