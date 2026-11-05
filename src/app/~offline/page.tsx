import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: "OpenAlfred: You're offline",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col h-screen w-full items-center px-12">
      <Image
        src="/logo-text-512x512.png"
        width={280}
        height={280}
        alt="OpenAlfred"
        className="sm:hidden"
      />
      <Image
        src="/logo-text-512x512.png"
        width={512}
        height={512}
        alt="OpenAlfred"
        className="hidden sm:block"
      />
      <p className="text-lg text-center">
        You&apos;re offline.
        <br />
        Please check your internet connection.
      </p>
    </div>
  );
}
