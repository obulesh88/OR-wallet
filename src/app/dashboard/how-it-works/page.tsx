import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

export default function HowItWorks() {
  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <HelpCircle />
                    How OR Wallet Works
                </CardTitle>
                <CardDescription>
                    A simple step-by-step guide to start earning.
                </CardDescription>
            </CardHeader>
        </Card>
      
      <div className="mt-8 space-y-12">
        <div className="relative">
            <div className="absolute left-6 top-6 h-full border-l-2 border-dashed border-border"></div>
            <div className="step flex items-start gap-6 relative">
                <div className="step-number flex-shrink-0 bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center text-2xl font-bold">1</div>
                <div className="bg-card p-6 rounded-lg border flex-1">
                    <h2 className="text-xl font-bold mb-2">Download & Sign Up</h2>
                    <p className="text-muted-foreground">Get OR Wallet from the Google Play Store. Register with your mobile number in just 30 seconds to create your free account.</p>
                </div>
            </div>
        </div>

        <div className="relative">
            <div className="absolute left-6 top-6 h-full border-l-2 border-dashed border-border"></div>
            <div className="step flex items-start gap-6 relative">
                <div className="step-number flex-shrink-0 bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center text-2xl font-bold">2</div>
                <div className="bg-card p-6 rounded-lg border flex-1">
                    <h2 className="text-xl font-bold mb-2">Browse Available Tasks</h2>
                    <p className="text-muted-foreground mb-4">Choose from 50+ daily tasks. Each task shows the exact earning amount, so you know what you'll make before you start.</p>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2"><span>🎮</span> <strong>Mobile Games:</strong> Earn ₹10-100 per game</li>
                        <li className="flex items-center gap-2"><span>📝</span> <strong>Surveys:</strong> Earn ₹20-200 per survey</li>
                        <li className="flex items-center gap-2"><span>🎬</span> <strong>Videos:</strong> Earn ₹5-50 per video</li>
                        <li className="flex items-center gap-2"><span>📱</span> <strong>App Testing:</strong> Earn ₹50-500 per app</li>
                    </ul>
                </div>
            </div>
        </div>

        <div className="relative">
            <div className="absolute left-6 top-6 h-full border-l-2 border-dashed border-border"></div>
            <div className="step flex items-start gap-6 relative">
                <div className="step-number flex-shrink-0 bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center text-2xl font-bold">3</div>
                <div className="bg-card p-6 rounded-lg border flex-1">
                    <h2 className="text-xl font-bold mb-2">Complete & Earn Instantly</h2>
                    <p className="text-muted-foreground">Finish tasks as instructed, and the money is added to your OR Wallet balance immediately. No waiting!</p>
                    <p className="mt-4 p-3 bg-muted rounded-md text-sm"><strong>Example:</strong> Complete a 15-minute game → Get ₹75 instantly</p>
                </div>
            </div>
        </div>

        <div className="relative">
            <div className="step flex items-start gap-6 relative">
                <div className="step-number flex-shrink-0 bg-primary text-primary-foreground h-12 w-12 rounded-full flex items-center justify-center text-2xl font-bold">4</div>
                <div className="bg-card p-6 rounded-lg border flex-1">
                    <h2 className="text-xl font-bold mb-2">Withdraw Anytime</h2>
                    <p className="text-muted-foreground">Cash out your earnings via UPI or bank transfer whenever you want. It’s your money, get it when you need it.</p>
                    <p className="mt-4 p-3 bg-muted rounded-md text-sm"><strong>Details:</strong> Minimum withdrawal is only ₹50. Processing is fast, usually within 2-4 hours.</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
