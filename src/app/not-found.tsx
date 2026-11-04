import Link from 'next/link';
import { Logo } from '@/features/shared/ui/logo/Logo';
import { buttonGreenClassName } from '@/features/shared/ui/control/button/buttonClassName';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center px-4 py-16 text-center">
      <Link href="/" className="-m-1.5 rounded-lg p-1.5">
        <Logo displayText />
      </Link>
      <p className="mt-16 text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">This page could not be found.</p>
      <Link href="/" className={`${buttonGreenClassName} mt-8`}>
        Return Home
      </Link>
    </div>
  );
}
