'use client';

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
import { useState } from "react";
import { List, ListItem } from "@/components/ui/list";

const games = [
  { id: 1, name: 'Coin Flip', description: 'Flip a coin, double or nothing.' },
  { id: 2, name: 'Lucky Number', description: 'Guess the number, win big.' },
  { id: 3, name: 'Puzzle Mania', description: 'Solve puzzles for ORA coins.' },
];

export default function EarnPage() {
  const [showGames, setShowGames] = useState(false);

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
          <CardContent className="flex-grow flex flex-col justify-center gap-4 p-6 pt-0">
             {showGames && (
              <List>
                {games.map((game) => (
                  <ListItem key={game.id} title={game.name}>
                    {game.description}
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setShowGames(!showGames)}>
                <Play className="mr-2 h-4 w-4" /> {showGames ? 'Hide Games' : 'Show Games'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
