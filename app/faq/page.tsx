import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { MessageCircleQuestion, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      question: "Is ImageCompress really free?",
      answer: "Yes! We offer a generous free tier that allows you to compress up to 100 images per batch. For professional users requiring higher volumes, we offer a Pro plan."
    },
    {
      question: "Where are my images processed?",
      answer: "Safety first! Your images are processed entirely within your browser using WebAssembly. We never upload your images to our servers, ensuring 100% privacy."
    },
    {
      question: "Which formats are supported?",
      answer: "We support PNG, JPG, WebP, and AVIF. You can convert between these formats easily while optimizing for size."
    },
    {
      question: "Can I use ImageCompress offline?",
      answer: "Once the app is loaded, the core compression logic runs locally. However, you need to be online initially to load the site and manage your subscription."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/2 left-0 -ml-24 w-72 h-72 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <Header />

      <main className="flex-1 w-full mx-auto px-6 py-12 md:py-20 relative z-10">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
              <MessageCircleQuestion className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary">Support Center</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Common <span className="text-primary italic">Questions</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about ImageCompress and how we handle your data.
            </p>
          </div>

          <div className="bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-4 md:p-8 shadow-2xl shadow-primary/5">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-b-0 border-border/50 py-1">
                  <AccordionTrigger className="text-left font-bold text-lg hover:text-primary transition-colors py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                      </div>
                      {faq.question}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base leading-relaxed pl-11 pb-6 pr-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <div className="text-center space-y-6 pt-4">
            <p className="text-muted-foreground">Still have questions?</p>
            <Button asChild size="lg" className="rounded-full shadow-lg shadow-primary/20">
              <Link href="mailto:support@imagecompress.com">
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
