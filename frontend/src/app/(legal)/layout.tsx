import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
          <article className="prose prose-neutral max-w-none dark:prose-invert">{children}</article>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
