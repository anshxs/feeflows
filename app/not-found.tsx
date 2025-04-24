// app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-slate-500 mb-6">404</h1>
      <p className="text-xl text-slate-400 mb-8">Page not found</p>
      <Link href="/" passHref>
        <Button>Back to Home</Button>
      </Link>
    </div>
  );
    }
