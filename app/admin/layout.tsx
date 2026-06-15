"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useAdminStore } from "@/lib/stores/admin-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Inbox, ScanSearch, CheckCircle, FolderOpen,
  Users, BarChart2, Settings, Bell, HelpCircle, LogOut, Menu, X, ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/dossiers", label: "Dossiers reçus", icon: Inbox, badgeKey: "en_attente" },
  { href: "/admin/scoring", label: "En cours de scoring", icon: ScanSearch, badgeKey: "en_cours" },
  { href: "/admin/publies", label: "Projets publiés", icon: CheckCircle },
  { href: "/admin/projets", label: "Tous les projets", icon: FolderOpen },
  { href: "/admin/investisseurs", label: "Investisseurs", icon: Users },
  { href: "/admin/statistiques", label: "Statistiques", icon: BarChart2 },
  { href: "/admin/parametres", label: "Paramètres", icon: Settings },
];

interface SidebarProps {
  pathname: string;
  analysteConnecte: { id: string; nom: string; prenom: string; role: "ADMIN" | "ANALYSTE" };
  sidebarCollapsed: boolean;
  onNavClick?: () => void;
}

function AdminSidebar({ pathname, analysteConnecte, sidebarCollapsed, onNavClick, notifCount }: SidebarProps & { notifCount: number }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <Link href="/admin/dashboard" className="block">
          <p className="text-white font-serif font-bold text-lg">Capilink</p>
          <p className="text-white/50 text-xs mt-0.5">Oriz Advisory — Back-office</p>
        </Link>
        <div className="mt-2">
          <span className="px-2 py-0.5 bg-[#C9A84C]/20 text-[#C9A84C] text-[10px] font-bold uppercase rounded-full">
            {analysteConnecte.role === "ADMIN" ? "Administrateur" : "Analyste"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          const badge = null; // Badges are shown dynamically on the dashboard page
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                active
                  ? "bg-white/10 text-white font-medium"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!sidebarCollapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {badge !== null && badge > 0 && (
                    <span className="px-1.5 py-0.5 bg-[#C9A84C] text-[#0A1628] text-[10px] font-bold rounded-full min-w-[18px] text-center">
                      {badge}
                    </span>
                  )}
                  {active && <ChevronRight size={12} className="text-white/40" />}
                </>
              )}
            </Link>
          );
        })}

        <div className="border-t border-white/10 my-3" />

        <Link
          href="/admin/notifications"
          onClick={onNavClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
            pathname.startsWith("/admin/notifications")
              ? "bg-white/10 text-white font-medium"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Bell size={16} />
          {!sidebarCollapsed && (
            <>
              <span className="flex-1">Notifications</span>
              {notifCount > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {notifCount > 99 ? "99+" : notifCount}
                </span>
              )}
            </>
          )}
        </Link>
        <Link
          href="/admin/aide"
          onClick={onNavClick}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
            pathname.startsWith("/admin/aide")
              ? "bg-white/10 text-white font-medium"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <HelpCircle size={16} />
          {!sidebarCollapsed && <span>Aide & documentation</span>}
        </Link>
      </nav>

      {/* Footer — analyste */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#0A1628] text-sm font-bold flex-shrink-0">
            {analysteConnecte.prenom.charAt(0)}{analysteConnecte.nom.charAt(0)}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{analysteConnecte.prenom} {analysteConnecte.nom}</p>
              <p className="text-white/40 text-xs">{analysteConnecte.role}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/connexion' })}
            className="text-white/40 hover:text-white transition-colors"
            title="Déconnexion"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { analysteConnecte, setAnalysteConnecte, sidebarCollapsed, toggleSidebar } = useAdminStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      const u = session.user as any;
      setAnalysteConnecte({
        id: u.id || "a1",
        nom: u.nom || u.name?.split(" ").slice(1).join(" ") || "Ekotto",
        prenom: u.prenom || u.name?.split(" ")[0] || "Marie",
        role: (u.role === "ADMIN" || u.role === "ANALYSTE" ? u.role : "ANALYSTE") as "ADMIN" | "ANALYSTE"
      });
    }
  }, [session, setAnalysteConnecte]);

  useEffect(() => {
    fetch("/api/notifications?limit=1")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setNotifCount(data.counts?.EN_ATTENTE || 0);
      })
      .catch(() => {});
  }, []);

  const pageTitle = NAV_ITEMS.find((i) => pathname.startsWith(i.href))?.label || "Back-office";

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F6F1]">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col flex-shrink-0 bg-[#0A1628] transition-all duration-200",
          sidebarCollapsed ? "w-16" : "w-60"
        )}
      >
        <AdminSidebar
          pathname={pathname}
          analysteConnecte={analysteConnecte}
          sidebarCollapsed={sidebarCollapsed}
          notifCount={notifCount}
        />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/60 flex">
          <aside className="w-64 bg-[#0A1628] flex flex-col h-full">
            <AdminSidebar
              pathname={pathname}
              analysteConnecte={analysteConnecte}
              sidebarCollapsed={false}
              onNavClick={() => setMobileSidebarOpen(false)}
              notifCount={notifCount}
            />
          </aside>
          <button
            className="flex-1"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Fermer le menu"
          />
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 lg:px-6 h-14 bg-white border-b flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden text-[#6B7280] hover:text-[#0A1628] p-1"
            >
              <Menu size={20} />
            </button>
            {/* Desktop sidebar toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:block text-[#6B7280] hover:text-[#0A1628] p-1"
            >
              {sidebarCollapsed ? <Menu size={16} /> : <X size={16} />}
            </button>
            <div>
              <p className="text-xs text-[#6B7280]">Back-office Oriz Advisory</p>
              <h1 className="text-sm font-semibold text-[#0A1628]">{pageTitle}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 text-[#6B7280] hover:text-[#0A1628]">
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-7 h-7 rounded-full bg-[#C9A84C] flex items-center justify-center text-[#0A1628] text-xs font-bold">
              {analysteConnecte.prenom.charAt(0)}{analysteConnecte.nom.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
