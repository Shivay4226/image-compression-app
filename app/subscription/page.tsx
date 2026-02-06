import Link from 'next/link';
import type { Metadata } from 'next';

import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SubscriptionPlanActions } from './plan-actions';

export const metadata: Metadata = {
  title: 'Subscription - ImageCompress',
  description: 'Upgrade to Pro for larger batch compression and future premium features.',
};

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams?: Promise<{ plan?: string }> | { plan?: string };
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const selectedPlan = resolvedSearchParams?.plan === 'pro' ? 'pro' : 'free';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold">Go Pro</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              This is a placeholder subscription page. Payment integration will be added later.
            </p>
          </div>

          <SubscriptionPlanActions selectedPlan={selectedPlan} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className={`p-8 ${selectedPlan === 'free' ? 'border-accent/40 bg-accent/5' : ''}`}>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-2xl font-bold">Free</p>
                  {selectedPlan === 'free' && (
                    <p className="text-sm font-semibold text-accent mt-1">Selected</p>
                  )}
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Up to 100 images per batch</p>
                  <p>PNG / JPG / WebP / AVIF</p>
                  <p>Basic compression settings</p>
                </div>
                {selectedPlan === 'free' ? (
                  <Button variant="outline" className="w-full bg-transparent" disabled>
                    Current plan
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/?plan=free">Continue Free</Link>
                  </Button>
                )}
              </div>
            </Card>

            <Card
              className={`p-8 border-accent/30 ${selectedPlan === 'pro' ? 'border-accent/60 bg-accent/5' : ''}`}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-2xl font-bold">Pro</p>
                  {selectedPlan === 'pro' && (
                    <p className="text-sm font-semibold text-accent mt-1">Selected</p>
                  )}
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Up to 1000 images per batch</p>
                  <p>Priority processing & future premium features</p>
                  <p>Designed for high-volume workflows</p>
                </div>
                <Button className="w-full" disabled>
                  {selectedPlan === 'pro' ? 'Selected (coming soon)' : 'Coming soon'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Payment integration will be added in a future update.
                </p>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button variant="link" asChild>
              <Link href="/">Back to Compress</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
