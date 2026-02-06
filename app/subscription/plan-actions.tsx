'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Zap, CheckCircle2 } from 'lucide-react';

type Plan = 'free' | 'pro';

export function SubscriptionPlanActions({ selectedPlan }: { selectedPlan: string }) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const isPro = (session?.user as any)?.isPro;
  const activePlan: Plan = isPro ? 'pro' : 'free';

  const handleUpgrade = async (targetPro: boolean) => {
    if (!session) {
      router.push(`/login?callbackUrl=/subscription`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPro: targetPro }),
      });

      if (!response.ok) throw new Error('Failed to update subscription');

      const data = await response.json();

      // Update session client-side
      await update({ isPro: targetPro });

      toast.success(data.message);
      router.refresh();
    } catch (error) {
      toast.error('Could not update plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 overflow-hidden relative">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Account Status</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold">
              Current Plan: <span className={isPro ? "text-accent" : "text-foreground"}>{activePlan.toUpperCase()}</span>
            </p>
            {isPro && <Zap className="h-5 w-5 fill-accent text-accent animate-pulse" />}
          </div>
          {isPro ? (
            <p className="text-sm text-green-500 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> All premium features unlocked
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Upgrade to remove batch limits and unlock priority processing</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          {isPro ? (
            <Button
              variant="outline"
              onClick={() => handleUpgrade(false)}
              disabled={isLoading}
              className="bg-transparent border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Downgrade to Free (Demo)
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => handleUpgrade(true)}
              disabled={isLoading}
              className="gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-8 shadow-lg shadow-accent/20 transition-all hover:scale-105 active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Zap className="h-5 w-5 fill-white" />
                  Upgrade to Pro Now
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
    </Card>
  );
}
