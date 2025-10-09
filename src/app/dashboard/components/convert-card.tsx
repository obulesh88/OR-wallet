import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowRight, Coins, IndianRupee, Repeat } from "lucide-react";

export function ConvertCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Convert</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-2 relative">
            <div className="p-4 bg-muted rounded-md">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">From</span>
                    <span className="text-xs text-muted-foreground">Available balance: 0</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Coins className="w-6 h-6 text-primary" />
                        <span className="font-bold text-lg">ORA</span>
                    </div>
                    <Input type="number" placeholder="0.00" className="text-right text-lg font-bold border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto" />
                </div>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Button variant="ghost" size="icon" className="bg-card hover:bg-muted rounded-full border">
                    <Repeat className="w-5 h-5" />
                </Button>
            </div>
            <div className="p-4 bg-muted rounded-md">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">To</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <IndianRupee className="w-6 h-6 text-green-500" />
                        <span className="font-bold text-lg">INR</span>
                    </div>
                    <div className="text-right text-lg font-bold text-muted-foreground">--</div>
                </div>
            </div>
        </div>

        <div className="text-sm text-center text-muted-foreground">
            1 ORA ≈ ₹0.01
        </div>

        <Button size="lg" className="w-full">
          Get Quote
        </Button>
      </CardContent>
    </Card>
  );
}
