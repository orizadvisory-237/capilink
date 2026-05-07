import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6F1]">
      <header className="h-16 flex items-center justify-center border-b bg-white">
        <Link href="/" className="text-2xl font-serif font-bold text-[#0A1628]">
          Capilink
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
