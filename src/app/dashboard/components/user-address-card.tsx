'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirestore, useUser } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { doc, onSnapshot } from "firebase/firestore";
import { Copy, KeyRound, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/firebase/errors";

export function UserAddressCard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [address, setAddress] = useState<string | null>(null);
  const [secretCode, setSecretCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (user && firestore) {
      // Generate a new secret code for the session
      const newSecretCode = Math.random().toString(36).substring(2, 10).toUpperCase();
      setSecretCode(newSecretCode);
      
      const userDocRef = doc(firestore, "users", user.uid);
      const unsubscribe = onSnapshot(userDocRef, 
        (doc) => {
          if (doc.exists()) {
            setAddress(doc.data().address);
            setError(null);
          } else {
            setError("User data not found.");
          }
        },
        async (err) => {
          const permissionError = new FirestorePermissionError({
            path: userDocRef.path,
            operation: 'get',
          } satisfies SecurityRuleContext);
  
          errorEmitter.emit('permission-error', permissionError);
          setError("Could not fetch address due to a permission error.");
        }
      );
      return () => unsubscribe();
    }
  }, [user, firestore]);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "Your address has been copied to the clipboard.",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Your ORA Address</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : address ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <p className="font-mono text-sm sm:text-base break-all">{address}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className={cn("ml-2", isCopied && "text-green-500")}
                  disabled={!address}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-1">
                This is only used to recieve ora coins
              </CardDescription>
            </div>
            {secretCode && (
              <div className="pt-4 border-t border-border">
                <CardTitle className="text-sm font-medium flex items-center gap-2 mb-2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  Your Secret Code for this Session
                </CardTitle>
                <p className="font-mono text-sm sm:text-base break-all">{secretCode}</p>
                 <CardDescription className="text-xs text-muted-foreground mt-1">
                  This code changes every time you log in.
                </CardDescription>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Generating address...</p>
        )}
      </CardContent>
    </Card>
  );
}
