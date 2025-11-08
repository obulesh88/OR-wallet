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
import { PartyPopper, Video, Puzzle, Gamepad2, Play, Eye, RefreshCw, Send, Check } from "lucide-react";
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
  const [isClaimingAd, setIsClaimingAd] = useState(false);
  const [adWatched, setAdWatched] = useState(false);
  const [adCooldown, setAdCooldown] = useState(0);

  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (adCooldown > 0) {
      timer = setTimeout(() => {
        setAdCooldown(adCooldown - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [adCooldown]);


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

  const handleRewardUser = async (rewardAmount: number, description: string) => {
     if (!user || !firestore) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to earn rewards." });
      return false;
    }
    const userDocRef = doc(firestore, 'users', user.uid);
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
            description: description,
            amount: rewardAmount,
            date: serverTimestamp(),
            status: 'Completed',
        };
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
      return true;

    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Reward Failed",
        description: e.message || "An error occurred.",
      });
      return false;
    }
  };

  const handleWatchAdClick = () => {
    window.open('https://enviousgarbage.com/bm3/Vh0/P.3/p/v/bTmuVkJAZ/D/0d2oNnjmIez/MQT/gg3/L/TMYB2CM/jiMzx/OkDCg_', '_blank', 'noopener,noreferrer');
    setAdWatched(true);
  }

  const handleClaimAdReward = async () => {
    setIsClaimingAd(true);
    const success = await handleRewardUser(3, 'Earned from watching an Ad');
    if(success) {
        setAdWatched(false);
        setAdCooldown(10);
    }
    setIsClaimingAd(false);
  }

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

    setIsVerifying(true);
    const success = await handleRewardUser(3, 'Earned from solving Captcha');
    if (success) {
      generateCaptcha();
    }
    setIsVerifying(false);
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
            {adWatched ? (
                 <Button className="w-full" onClick={handleClaimAdReward} disabled={isClaimingAd}>
                    {isClaimingAd ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Claiming...
                        </>
                    ) : (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            Claim Reward
                        </>
                    )}
                 </Button>
            ) : (
                <Button className="w-full" onClick={handleWatchAdClick} disabled={adCooldown > 0}>
                    {adCooldown > 0 ? (
                        `Wait ${adCooldown}s`
                    ) : (
                        <>
                            <Eye className="mr-2 h-4 w-4" /> Watch
                        </>
                    )}
                </Button>
            )}
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
                   <div className="bg-muted p-4 rounded-md text-2xl font-bold tracking-widest select-none font-mono text-center">
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
