import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <Card className="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p>
          Ask your administrator for a new temporary password. After signing in,
          you can change it from My profile.
        </p>
        <Link href="/auth/login" className="inline-block underline">
          Back to login
        </Link>
      </CardContent>
    </Card>
  );
}
