import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Gift } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';

export function ExchangeCard() {
  const giftCards = PlaceHolderImages;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift />
          Exchange Ora Coins
        </CardTitle>
        <CardDescription>
          Redeem your Ora Coins for gift cards from your favorite brands.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gift Card</TableHead>
              <TableHead>Value</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {giftCards.map((card) => (
              <TableRow key={card.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Image
                      src={card.imageUrl}
                      alt={card.description}
                      width={40}
                      height={40}
                      className="rounded-md"
                      data-ai-hint={card.imageHint}
                    />
                    <span className="font-medium">{card.description}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">₹500 - ₹5,000</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/rewards">
                      Redeem <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
