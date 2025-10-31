import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PartyPopper, Video } from "lucide-react";

export default function EarnPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video />
            Earn Rewards
          </CardTitle>
          <CardDescription>
            Watch videos to earn ORA coins.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <PartyPopper className="w-16 h-16 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">
              Coming Soon!
            </h2>
            <p className="text-muted-foreground max-w-sm">
              We&apos;re working hard to bring you exciting ways to earn rewards. Please check back later.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
