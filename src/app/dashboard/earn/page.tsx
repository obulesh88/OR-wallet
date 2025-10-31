import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartyPopper, Video, Puzzle, Gamepad2 } from "lucide-react";

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
            watching ads, solving captchas, and playing games to earn coins
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Watch Ads Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5" />
              Watch Ads
            </CardTitle>
            <CardDescription>
              Watch short video ads to earn free coins instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center gap-4 p-6 pt-0">
            <PartyPopper className="w-12 h-12 text-primary" />
            <h3 className="text-xl font-bold tracking-tight">
              Coming Soon!
            </h3>
            <p className="text-muted-foreground text-sm">
              This feature is under development.
            </p>
          </CardContent>
        </Card>

        {/* Solve Captcha Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="w-5 h-5" />
              Solve Captcha
            </CardTitle>
            <CardDescription>
              Solve simple captchas to earn coins.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center gap-4 p-6 pt-0">
            <PartyPopper className="w-12 h-12 text-primary" />
            <h3 className="text-xl font-bold tracking-tight">
              Coming Soon!
            </h3>
            <p className="text-muted-foreground text-sm">
              This feature is under development.
            </p>
          </CardContent>
        </Card>

        {/* Games Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              Play Games
            </CardTitle>
            <CardDescription>
              Play fun games and earn rewards.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center gap-4 p-6 pt-0">
            <PartyPopper className="w-12 h-12 text-primary" />
            <h3 className="text-xl font-bold tracking-tight">
              Coming Soon!
            </h3>
            <p className="text-muted-foreground text-sm">
              This feature is under development.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
