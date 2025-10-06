import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, Users, Twitter, Facebook, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const referrals = [
  {
    name: 'John Doe',
    avatar: '/avatars/01.png',
    date: '2023-11-15',
    status: 'Completed',
  },
  {
    name: 'Jane Smith',
    avatar: '/avatars/02.png',
    date: '2023-11-10',
    status: 'Completed',
  },
  {
    name: 'Mike Johnson',
    avatar: '/avatars/03.png',
    date: '2023-11-05',
    status: 'Pending',
  },
  {
    name: 'Sarah Williams',
    avatar: '/avatars/04.png',
    date: '2023-10-28',
    status: 'Completed',
  },
];

export default function ReferralsPage() {
  const referralLink = 'https://coincraft.app/ref/user123';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users />
            Referrals
          </CardTitle>
          <CardDescription>
            Invite your friends and earn rewards.
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Refer a friend and get 500 coins</CardTitle>
            <CardDescription>
              Share your referral link with your friends. When they sign up,
              you&apos;ll both get 500 bonus coins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label
                htmlFor="referral-link"
                className="text-sm font-medium"
              >
                Your referral link
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="referral-link"
                  readOnly
                  value={referralLink}
                  className="bg-input"
                />
                <Button variant="outline" size="icon">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Share on social media
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="w-full">
                  <Twitter className="mr-2" /> Twitter
                </Button>
                <Button variant="outline" className="w-full">
                  <Facebook className="mr-2" /> Facebook
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2" /> WhatsApp
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((referral) => (
                  <TableRow key={referral.name}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={`https://i.pravatar.cc/40?u=${referral.name}`} />
                          <AvatarFallback>
                            {referral.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{referral.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(referral.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          referral.status === 'Completed'
                            ? 'secondary'
                            : 'default'
                        }
                        className={cn(referral.status === 'Completed' ? 'bg-green-700/20 text-green-400 border-green-700/40 hover:bg-green-700/30' : '')}
                      >
                        {referral.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
