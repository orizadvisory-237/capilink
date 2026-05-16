import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, FileText, Lock, Download, ShieldCheck } from "lucide-react";

export default async function DataRoomPage({ params }: { params: Promise<{ projetId: string }> }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "INVESTISSEUR") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Lock size={48} className="text-[#C0392B] mb-4" />
        <h1 className="text-2xl font-bold text-[#0A1628]">Accès sécurisé</h1>
        <p className="text-[#6B7280] mt-2">Veuillez vous connecter pour accéder à l&apos;espace confidentiel.</p>
        <Link href="/connexion" className="mt-6 px-6 py-2 bg-[#0A1628] text-white rounded-lg">Se connecter</Link>
      </div>
    );
  }

  const { projetId } = await params;

  // Vérifier l'autorisation : Le contact investisseur doit être au statut DEAL_EN_COURS
  const permission = await prisma.contactInvestisseur.findFirst({
    where: {
      projetId,
      investisseurId: session.user.id,
      statutSuivi: "DEAL_EN_COURS",
    },
    include: {
      projet: {
        include: {
          documents: true,
          porteur: { select: { nom: true, prenom: true } }
        }
      }
    }
  });

  if (!permission) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldCheck size={64} className="text-[#C9A84C] mb-4" />
        <h1 className="text-2xl font-bold text-[#0A1628]">Data Room verrouillée</h1>
        <p className="text-[#6B7280] mt-2 max-w-md">
          L&apos;accès à cette Data Room nécessite une approbation de l&apos;équipe Oriz Advisory. Votre statut sur ce projet n&apos;est pas encore au stade d&apos;analyse financière.
        </p>
        <Link href="/espace-investisseur" className="mt-6 px-6 py-2 border border-[#0A1628] text-[#0A1628] rounded-lg">Retour à mon tableau de bord</Link>
      </div>
    );
  }

  const projet = permission.projet;
  
  // Dictionnaire de traduction des types de documents
  const DOC_LABELS: Record<string, string> = {
    BUSINESS_PLAN: "Business Plan détaillé",
    ETATS_FINANCIERS: "États Financiers",
    STATUTS: "Statuts juridiques de la société",
    PIECE_IDENTITE: "Pièce d'identité du dirigeant",
    AUTRE: "Document annexe",
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] py-10">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="flex items-center gap-4 text-sm text-[#6B7280] mb-8">
          <Link href="/espace-investisseur" className="hover:text-[#0A1628] flex items-center gap-1">
            <ArrowLeft size={16} /> Retour à mon espace
          </Link>
          <span>/</span>
          <span className="font-medium text-[#0A1628]">Data Room - {projet.reference}</span>
        </div>

        <div className="bg-[#0A1628] text-white p-8 rounded-xl shadow-md border-b-4 border-[#C9A84C]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 text-[#C9A84C]">
                <ShieldCheck size={18} />
                <span className="text-xs font-bold uppercase tracking-wider">Zone Confidentielle Sous NDA</span>
              </div>
              <h1 className="text-2xl font-serif font-bold mb-1">{projet.titre}</h1>
              <p className="text-xl text-gray-300">
                Porté par : {projet.porteur.prenom} {projet.porteur.nom}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-bold text-[#0A1628] mb-6 flex items-center gap-2">
            <FileText size={20} className="text-[#C9A84C]" />
            Documents Financiers & Juridiques
          </h2>

          {projet.documents.length === 0 ? (
            <div className="text-center py-10 text-[#6B7280] bg-gray-50 rounded-lg">
              Le porteur n&apos;a pas encore téléversé les documents ou ceux-ci sont en cours d&apos;inspection.
            </div>
          ) : (
            <div className="grid gap-4">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {projet.documents.map((doc: any) => (
                <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:border-[#C9A84C] transition-colors gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#0A1628]/5 p-3 rounded-lg text-[#0A1628]">
                      <FileText size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0A1628]">{DOC_LABELS[doc.type] || doc.type}</h3>
                      <p className="text-xs text-[#6B7280]">
                        Ajouté le {new Date(doc.createdAt).toLocaleDateString("fr-FR")} • {(doc.taille / 1024 / 1024).toFixed(2)} Mo
                        {doc.verifie && <span className="ml-2 text-[#2D6A4F] font-bold">✓ Audit OK</span>}
                      </p>
                    </div>
                  </div>
                  
                  <Link 
                    href={doc.url} 
                    target="_blank"
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#0A1628] font-medium text-sm rounded-lg transition-colors w-full sm:w-auto justify-center"
                  >
                    <Download size={16} /> 
                    Consulter
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
