export const dynamic = "force-dynamic";

import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getBoards } from "@/lib/data";
import Link from "next/link";
import { Suspense } from "react";
import Image from "next/image";

export default async function Home() {
  const boards = await getBoards();

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="w-full flex justify-center pt-6">
          <Image
            src="/logo.png"
            alt="Kid Gorges Book Club"
            width={400}
            height={300}
            priority
            className="h-auto w-56"
          />
        </div>
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            {/* Book Club! 📚 */}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <main className="flex-1 flex flex-col gap-6 px-4">
            <div className="flex flex-col gap-2">
              <span className="text-4xl">Books We're Reading:</span>
              {boards.map((b) => (
                <Link key={b.id} href={`/board/${b.slug}`} className="hover:underline">
                  {b.name}
                </Link>
              ))}
            </div>
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-4">
          <ThemeSwitcher />
          <Suspense>
            <AuthButton/>
          </Suspense>
        </footer>
      </div>
    </main>
  );
}
