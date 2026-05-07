import Link from "next/link";
import { Button } from "@/components/ui/button";

import { auth } from "@/auth";

export default async function InvestisseurLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F6F1]">
      <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-serif font-bold text-[#0A1628]">Capilink</Link>
          </div>
          
          <nav className="hidden md:flex gap-6 text-sm font-medium text-[#6B7280]">
            <Link href="/vitrine" className="text-[#0A1628] font-bold">Vitrine Projets</Link>
            <Link href="/a-propos" className="hover:text-[#0A1628]">À propos</Link>
            <Link href="mailto:contact@orizadvisory.cm" className="hover:text-[#0A1628]">Contact Oriz</Link>
          </nav>
          
          <div className="flex gap-2 items-center">
            {session?.user ? (
              <Link 
                href={session.user.role === 'INVESTISSEUR' ? '/espace-investisseur' : session.user.role === 'PORTEUR' ? '/dashboard' : '/admin/dashboard'} 
                className="hidden sm:flex bg-[#0A1628] rounded-md px-4 py-2 text-sm font-bold text-white hover:bg-[#0A1628]/90 transition-colors"
              >
                Mon Espace {session.user.role === 'INVESTISSEUR' ? 'Privé' : ''}
              </Link>
            ) : (
              <Link 
                href="/connexion" 
                className="hidden sm:flex border border-[#0A1628] rounded-md px-4 py-2 text-sm font-medium text-[#0A1628] hover:bg-[#0A1628] hover:text-white transition-colors"
              >
                Espace Membre
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
