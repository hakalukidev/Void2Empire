export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <article className="prose prose-neutral max-w-none dark:prose-invert">{children}</article>
    </div>
  );
}
