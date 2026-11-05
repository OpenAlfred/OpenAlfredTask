import '../globals.css';
import Link from 'next/link';
import { Logo } from '@/features/shared/ui/logo/Logo';

export const dynamic = 'force-dynamic';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col items-center bg-sidebar px-4 pb-16 pt-12 sm:pt-20">
      <Link href="/" className="-m-1.5 rounded-lg p-1.5">
        <Logo displayText />
      </Link>
      <div className="mt-8 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
