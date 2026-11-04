import '../globals.css';
import { Header } from '@/features/marketing/shared/ui/Header';
import { Footer } from '@/features/marketing/shared/ui/Footer';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    // The marketing pages aren't designed for dark mode, so they stay light.
    <div className="theme-light flex flex-1 flex-col bg-background text-foreground">
      <div className="flex flex-1 flex-col bg-white">
        <Header />
        <div className="relative px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-20">{children}</div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
