
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PartyPopper, Video, Puzzle, Gamepad2, Play, Eye } from "lucide-react";

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
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Watch Ads
            </CardTitle>
            <CardDescription>
              Watch short video ads to earn free coins instantly.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-4 p-6 pt-0">
            <PartyPopper className="w-12 h-12 text-primary" />
            <h3 className="text-xl font-bold tracking-tight">
              Coming Soon!
            </h3>
            <p className="text-muted-foreground text-sm">
              This feature is under development.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>
                <Eye className="mr-2 h-4 w-4" /> Watch
            </Button>
          </CardFooter>
        </Card>

        {/* Solve Captcha Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Puzzle className="w-5 h-5" />
              Solve Captcha
            </CardTitle>
            <CardDescription>
              Solve simple captchas to earn coins.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-4 p-6 pt-0">
            <PartyPopper className="w-12 h-12 text-primary" />
            <h3 className="text-xl font-bold tracking-tight">
              Coming Soon!
            </h3>
            <p className="text-muted-foreground text-sm">
              This feature is under development.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>
                <Puzzle className="mr-2 h-4 w-4" /> Solve
            </Button>
          </CardFooter>
        </Card>

        {/* Games Card */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gamepad2 className="w-5 h-5" />
              Play Games
            </CardTitle>
            <CardDescription>
              Play fun games and earn rewards.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center text-center gap-4 p-6 pt-0">
            <PartyPopper className="w-12 h-12 text-primary" />
            <h3 className="text-xl font-bold tracking-tight">
              Coming Soon!
            </h3>
            <p className="text-muted-foreground text-sm">
              This feature is under development.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>
                <Play className="mr-2 h-4 w-4" /> Play
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
