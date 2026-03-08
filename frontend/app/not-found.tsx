import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <GraduationCap className="w-7 h-7 text-muted-foreground" />
      </div>

      <p className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-3">
        404
      </p>

      <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
        Page not found
      </h1>

      <p className="text-sm text-muted-foreground max-w-xs mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
