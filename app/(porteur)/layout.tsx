import Link from "next/link";
import { User, FileText, PlusCircle, LayoutDashboard, LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";

export default async function PorteurLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const prenom = (session?.user as any)?.prenom || session?.user?.name?.split(" ")[0] || "";
  const nom = (session?.user as any)?.nom || session?.user?.name?.split(" ").slice(1).join(" ") || "";
  const displayName = prenom && nom ? `${prenom} ${nom.charAt(0)}.` : prenom || nom || "Porteur";
  return (
    <div className="flex h-screen bg-[#F8F6F1]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="text-xl font-serif font-bold text-[#0A1628]">Capilink</Link>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="/mon-dossier" className="flex items-center gap-3 px-3 py-2 rounded-md text-[#0A1628] bg-gray-50 hover:bg-gray-100 font-medium">
            <LayoutDashboard size={18} />
            <span>Mon Dossier</span>
          </Link>
          <Link href="/soumettre" className="flex items-center gap-3 px-3 py-2 rounded-md text-[#6B7280] hover:bg-gray-50 hover:text-[#0A1628]">
            <PlusCircle size={18} />
            <span>Soumettre un projet</span>
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-[#6B7280] hover:bg-gray-50 hover:text-[#0A1628]">
            <FileText size={18} />
            <span>Mes Documents</span>
          </Link>
        </nav>
        {/* Sidebar Footer with user info & logout */}
        <div className="p-4 border-t mt-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#0A1628] flex items-center justify-center text-white flex-shrink-0">
              <User size={16} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-[#0A1628] truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">Porteur</p>
            </div>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/connexion" });
            }}
          >
            <button
              type="submit"
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"
              title="Se déconnecter"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6">
          <div className="md:hidden font-serif font-bold text-[#0A1628]">Capilink</div>
          <div className="flex-1 flex justify-end items-center gap-4">
            <span className="text-sm text-[#6B7280] hidden sm:block">Espace Porteur</span>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#0A1628] flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <span className="font-medium text-sm hidden sm:block">{displayName}</span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/connexion" });
                }}
                className="inline-flex"
              >
                <button
                  type="submit"
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors ml-1"
                  title="Se déconnecter"
                >
                  <LogOut size={16} />
                </button>
              </form>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
