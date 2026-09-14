import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">BinaryTrade Pro</h1>
      <p className="max-w-md text-muted-foreground">
        Futures and binary options trading, with a risk-free demo account to practice on.
      </p>
      <div className="flex gap-4">
        <Link href="/register">
          <Button>Create account</Button>
        </Link>
        <Link href="/login">
          <Button variant="secondary">Log in</Button>
        </Link>
      </div>
    </div>
  );
}
