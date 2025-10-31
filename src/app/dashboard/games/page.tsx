import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Gamepad2 } from 'lucide-react';
import Image from 'next/image';

export default function GamesPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 />
            Game Hub
          </CardTitle>
          <CardDescription>
            Play games, complete challenges, and earn real rewards.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <Image
            src="https://picsum.photos/seed/1/600/300"
            alt="Jungle Runner game"
            width={600}
            height={300}
            className="w-full h-auto object-cover"
            data-ai-hint="bamboo forest"
          />
        </CardContent>
        <div className="p-6">
            <CardTitle className="text-2xl">Jungle Runner</CardTitle>
            <CardDescription className="mt-2">
                An exciting 3D endless runner game set in a lush jungle environment.
                Avoid obstacles and collect coins!
            </CardDescription>
            <div className="flex justify-between items-center mt-6">
                <p className="font-semibold text-primary">Up to 10 ORA/min</p>
                <Button disabled>Play Now</Button>
            </div>
        </div>
      </Card>
    </div>
  );
}
