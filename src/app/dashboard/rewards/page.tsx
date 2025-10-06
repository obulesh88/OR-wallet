import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift } from "lucide-react";

export default function RewardsPage() {
  const giftCards = PlaceHolderImages.filter(img => img.imageHint.includes("giftcard"));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift />
            Rewards & Gift Cards
          </CardTitle>
          <CardDescription>
            Redeem your coins for exciting rewards and gift cards from popular
            brands.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {giftCards.map((card) => (
          <Card key={card.id}>
            <CardContent className="p-0">
              <Image
                src={card.imageUrl}
                alt={card.description}
                width={200}
                height={120}
                className="w-full h-32 object-cover rounded-t-lg"
                data-ai-hint={card.imageHint}
              />
            </CardContent>
            <CardHeader>
              <CardTitle className="text-lg">{card.description}</CardTitle>
              <CardDescription>Starting from 5,000 coins</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button className="w-full">Redeem</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
