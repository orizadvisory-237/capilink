import Link from "next/link";

export default function NonAutorisePage() {
  return (
    <div className="min-h-screen bg-[#F8F6F1] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="text-6xl mb-6">🔒</div>
        <h1 className="text-3xl font-serif font-bold text-[#0A1628] mb-3">Accès réservé</h1>
        <p className="text-[#6B7280] mb-2">
          Cette section est réservée aux membres de l&apos;équipe Oriz Advisory.
        </p>
        <p className="text-sm text-[#6B7280] mb-8">
          Si vous êtes un analyste, contactez votre administrateur pour obtenir les accès.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-2.5 bg-[#0A1628] text-white rounded-lg text-sm font-medium hover:bg-[#0A1628]/90 transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/vitrine"
            className="px-6 py-2.5 border border-[#0A1628] text-[#0A1628] rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Voir la vitrine
          </Link>
        </div>
      </div>
    </div>
  );
}
