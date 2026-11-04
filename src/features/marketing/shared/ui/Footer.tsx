import Link from 'next/link';
import { GitHubLogoIcon } from '@/features/shared/ui/icon/GitHubLogoIcon';

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-sidebar">
      <div className="items-center px-6 py-6 text-muted-foreground md:flex md:justify-between lg:px-8">
        <p className="text-center text-sm md:text-left">
          © OpenTask
          <span className="ml-3">|</span>
          <Link href="/privacy" className="ml-3 hover:text-foreground">
            Privacy
          </Link>
          <span className="ml-3">|</span>
          <Link href="/terms" className="ml-3 hover:text-foreground">
            Terms
          </Link>
        </p>
        <div className="mt-6 flex justify-center md:mt-0">
          <Link
            className="mr-6 rounded-full hover:text-foreground"
            href="https://github.com/flsilva/opentask/"
          >
            <span className="sr-only">OpenTask on GitHub</span>
            <GitHubLogoIcon
              aria-hidden="true"
              className="fill-current"
              width="1.75rem"
              height="1.75rem"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
};
