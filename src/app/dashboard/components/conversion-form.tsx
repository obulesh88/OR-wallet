"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  suggestOptimalConversionRates,
  type SuggestOptimalConversionRatesOutput,
} from "@/ai/flows/suggest-optimal-conversion-rates";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: "Amount must be positive." }),
  targetCurrency: z.string().min(1, { message: "Please select a currency." }),
});

export function ConversionForm() {
  const [suggestion, setSuggestion] =
    useState<SuggestOptimalConversionRatesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 1000,
      targetCurrency: "USD",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestion(null);

    try {
      const input = {
        coinType: "CoinCraft Coin",
        targetCurrency: values.targetCurrency,
        historicalData:
          "Last 7 days avg rate: 0.01 USD. Last 30 days avg rate: 0.012 USD. All-time high: 0.025 USD.",
        marketTrends:
          "Overall crypto market is currently bullish. The USD is stable. There is high demand for in-app credits and gift cards, which may inflate the coin's value.",
      };

      const result = await suggestOptimalConversionRates(input);
      setSuggestion(result);
    } catch (error) {
      console.error("AI suggestion failed:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get conversion suggestion. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coin Conversion</CardTitle>
        <CardDescription>
          Use our AI-powered tool to find the best conversion rates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 items-start md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coins to Convert</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetCurrency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Currency</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="INR">INR (₹)</SelectItem>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="md:pt-8">
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 animate-spin" />
                  ) : (
                    <Wand2 className="mr-2" />
                  )}
                  Get Suggestion
                </Button>
              </div>
            </div>
          </form>
        </Form>
        {suggestion && (
          <div className="mt-6 space-y-4">
            <Alert>
              <Wand2 className="h-4 w-4" />
              <AlertTitle>AI-Powered Suggestion</AlertTitle>
              <AlertDescription className="space-y-4">
                <div className="mt-2">
                  <p className="font-semibold">
                    Suggested Rate:{" "}
                    <span className="text-primary">
                      {suggestion.suggestedRate}{" "}
                      {form.getValues("targetCurrency")} / coin
                    </span>
                  </p>
                  <p className="mt-2 text-sm">{suggestion.reasoning}</p>
                  {suggestion.disclaimer && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {suggestion.disclaimer}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button>Accept & Convert Now</Button>
                  <Button variant="ghost" onClick={() => setSuggestion(null)}>
                    Decline
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
