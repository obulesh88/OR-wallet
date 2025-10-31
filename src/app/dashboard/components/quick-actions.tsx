import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Video className="size-5" /> Earn Rewards
          </CardTitle>
          <CardDescription>
            watching ads, solving captchas, and playing games to earn coins
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" asChild>
            <Link href="/dashboard/earn">Click</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
