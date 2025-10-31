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
import { PartyPopper, Video, Puzzle, Gamepad2, Play, Eye, RefreshCw, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { doc, runTransaction, serverTimestamp, collection, addDoc } from "firebase/firestore";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";
import Link from "next/link";

export default function EarnPage() {
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaText, setCaptchaText] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setCaptchaInput('');
  };

  useEffect(() => {
    if (showCaptcha) {
      generateCaptcha();
    }
  }, [showCaptcha]);

  const handleCaptchaVerify = async () => {
    if (captchaInput.toLowerCase() !== captchaText.toLowerCase()) {
      toast({
        variant: "destructive",
        title: "Incorrect Captcha",
        description: "Please try again.",
      });
      generateCaptcha();
      return;
    }

    if (!user || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to earn rewards." });
      return;
    }

    setIsVerifying(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    const rewardAmount = 10; // 10 ORA coins

    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          throw new Error("User document not found");
        }

        const currentOraBalance = userDoc.data().oraBalance || 0;
        const newOraBalance = currentOraBalance + rewardAmount;
        transaction.update(userDocRef, { oraBalance: newOraBalance });

        const transactionsColRef = collection(firestore, 'users', user.uid, 'transactions');
        const transactionData = {
            type: 'earn',
            description: 'Earned from solving Captcha',
            amount: rewardAmount,
            date: serverTimestamp(),
            status: 'Completed',
        };
        // Not awaiting this to keep UI responsive
        addDoc(transactionsColRef, transactionData).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: transactionsColRef.path,
                operation: 'create',
                requestResourceData: transactionData,
            });
            errorEmitter.emit('permission-error', permissionError);
        });
      });

      toast({
        title: "Success!",
        description: `You've earned ${rewardAmount} ORA coins!`,
      });
      generateCaptcha();

    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Reward Failed",
        description: e.message || "An error occurred.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

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
          <CardContent className="flex-grow flex flex-col justify-center text-center gap-4 p-6 pt-0">
             {showCaptcha && (
                <div className="space-y-4">
                   <div className="bg-muted p-4 rounded-md text-2xl font-bold tracking-widest select-none font-mono line-through text-center">
                        {captchaText}
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                          placeholder="Enter captcha text" 
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          disabled={isVerifying}
                      />
                      <Button variant="ghost" size="icon" onClick={generateCaptcha} disabled={isVerifying}>
                        <RefreshCw className="w-5 h-5" />
                      </Button>
                    </div>
                    <Button onClick={handleCaptchaVerify} disabled={isVerifying || !captchaInput} className="w-full">
                        <Send className="mr-2 h-4 w-4" />
                        {isVerifying ? 'Verifying...' : 'Submit'}
                    </Button>
                </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => setShowCaptcha(!showCaptcha)}>
                <Puzzle className="mr-2 h-4 w-4" /> {showCaptcha ? 'Hide Captcha' : 'Solve'}
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
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
                <Link href="/dashboard/games">
                    <Play className="mr-2 h-4 w-4" /> Play
                </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
