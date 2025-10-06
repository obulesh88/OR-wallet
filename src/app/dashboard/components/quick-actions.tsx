import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";

export function QuickActions() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Video className="size-5" /> Earn Rewards
          </CardTitle>
          <CardDescription>
            Watch short video ads to earn free coins instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Watch Ads</Button>
        </CardContent>
      </Card>
    </div>
  );
}
