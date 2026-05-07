import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Sécurité | Administration Capilink",
  description: "Journal de Sécurité et Audit",
};

export default async function AdminSecurite() {
  const session = await auth();

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/connexion");
  }

  // Récupération des logs de sécurité
  const logs = await prisma.journalSecurite.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: { email: true, nom: true, prenom: true }
      }
    }
  });

  // Utilisateurs verrouillés
  const lockedUsers = await prisma.user.findMany({
    where: { compteVerrouille: true },
    select: { id: true, email: true, verrouillageExpireAt: true, tentativesConnexion: true } as any
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow border border-red-100">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#0A1628]">Centre de Sécurité</h1>
          <p className="text-sm text-[#6B7280]">Surveillance et événements d&apos;authentification</p>
        </div>
        <div className="flex bg-red-50 p-3 rounded text-red-700 items-center justify-center font-bold">
          {lockedUsers.length} Comptes Verrouillés
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="p-4 font-bold border-b bg-gray-50 text-gray-800">Derniers événements</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Utilisateur</th>
                <th className="px-6 py-3">IP Source</th>
                <th className="px-6 py-3">Détails</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {logs.map((log: any) => (
                <tr key={log.id} className="border-b hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                    {log.createdAt.toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    <span className={`px-2 py-1 rounded text-xs ${log.type.includes('ECHEC') || log.type.includes('NON_AUTORISE') ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {log.type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {log.userId && (log as any).user ? `${(log as any).user.prenom} ${(log as any).user.nom}` : '-'}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">{log.ip}</td>
                  <td className="px-6 py-4 text-xs max-w-xs truncate">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Aucun événement de sécurité enregistré.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
