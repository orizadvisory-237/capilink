import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#F8F6F1]">
      {/* Header court et fixe */}
      <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold text-[#0A1628]">Capilink</span>
            <span className="text-sm font-medium text-[#C9A84C] hidden sm:inline-block">by Oriz Advisory</span>
          </div>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-[#6B7280]">
            <Link href="/soumettre" className="hover:text-[#0A1628]">Soumettre un projet</Link>
            <Link href="/vitrine" className="hover:text-[#0A1628]">Voir la vitrine</Link>
            <Link href="#about" className="hover:text-[#0A1628]">À propos</Link>
          </nav>
          <div>
            <Link href="/connexion" className="inline-flex h-9 items-center justify-center rounded-md border border-[#0A1628] bg-transparent px-4 text-sm font-medium text-[#0A1628] transition-colors hover:bg-[#0A1628] hover:text-white">
              Connexion
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-20 md:py-32 px-4 shadow-sm bg-gradient-to-b from-white to-[#F8F6F1]">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-6xl font-serif text-[#0A1628] mb-6 leading-tight">
            La passerelle entre projets camerounais et capitaux privés
          </h1>
          <p className="text-xl text-[#6B7280] mb-10 max-w-3xl mx-auto">
            Capilink connecte les porteurs de projets ambitieux aux investisseurs qualifiés, avec le scoring indépendant d&apos;Oriz Advisory comme garantie de qualité.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/soumettre" className="inline-flex items-center justify-center h-9 px-8 rounded-lg bg-[#C9A84C] hover:bg-[#b09240] text-[#0A1628] font-bold text-sm transition-colors">
              Soumettre mon projet →
            </Link>
            <Link href="/vitrine" className="inline-flex items-center justify-center h-9 px-8 rounded-lg border border-[#0A1628] text-[#0A1628] hover:bg-[#0A1628] hover:text-white text-sm font-medium transition-colors">
              Explorer la vitrine
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="card p-6 bg-white flex flex-col items-center">
              <span className="text-4xl font-bold text-[#0A1628] mb-2">47</span>
              <span className="text-sm text-[#6B7280] uppercase tracking-wider">Projets scorés</span>
            </div>
            <div className="card p-6 bg-white flex flex-col items-center">
              <span className="text-4xl font-bold text-[#C9A84C] mb-2">2.8 Mds</span>
              <span className="text-sm text-[#6B7280] uppercase tracking-wider">FCFA Mobilisés</span>
            </div>
            <div className="card p-6 bg-white flex flex-col items-center">
              <span className="text-4xl font-bold text-[#0A1628] mb-2">12</span>
              <span className="text-sm text-[#6B7280] uppercase tracking-wider">Secteurs couverts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-serif text-center text-[#0A1628] mb-16">Comment ça marche</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h3 className="text-2xl font-bold text-[#C9A84C] mb-8 border-b pb-4">Pour le Porteur de Projet</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0A1628] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Soumission du dossier</h4>
                    <p className="text-[#6B7280]">Complétez votre profil et téléchargez vos documents clés de façon sécurisée.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0A1628] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Scoring Oriz Advisory</h4>
                    <p className="text-[#6B7280]">Nos experts analysent et attribuent un score selon 5 dimensions clés.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#0A1628] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Mise en relation</h4>
                    <p className="text-[#6B7280]">Votre projet est publié et visible par notre réseau d&apos;investisseurs qualifiés.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-[#0A1628] mb-8 border-b pb-4">Pour l&apos;Investisseur</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C] text-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Accès libre à la vitrine</h4>
                    <p className="text-[#6B7280]">Parcourez librement le catalogue des projets anonymisés en recherche de fonds.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C] text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Consultation des fiches</h4>
                    <p className="text-[#6B7280]">Accédez aux détails des KPIs et des scores dimensionnels réalisés par Oriz.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C9A84C] text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Contact direct</h4>
                    <p className="text-[#6B7280]">Manifestez votre intérêt pour être mis en relation directe avec le porteur.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pourquoi Capilink */}
      <section id="about" className="py-20 px-4 bg-[#0A1628] text-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-serif text-center mb-16 text-[#C9A84C]">Pourquoi Capilink ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
              <h4 className="font-bold text-lg !text-white mb-3">Scoring indépendant</h4>
              <p className="text-gray-400 text-sm">Chaque projet est rigoureusement évalué sur 5 dimensions objectives, limitant le risque pour l&apos;investisseur.</p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
              <h4 className="font-bold text-lg !text-white mb-3">Catalogue 100% vérifié</h4>
              <p className="text-gray-400 text-sm">Finis les projets fantômes. L&apos;identité des porteurs et la base des projets sont vérifiées avant publication.</p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
              <h4 className="font-bold text-lg !text-white mb-3">Tiers de confiance Oriz</h4>
              <p className="text-gray-400 text-sm">Bénéficiez de l&apos;expertise reconnue du cabinet camerounais Oriz Advisory dans la modélisation économique.</p>
            </div>
            <div className="p-6 rounded-lg bg-gray-800/50 border border-gray-700">
              <h4 className="font-bold text-lg !text-white mb-3">Marché CEMAC spécialisé</h4>
              <p className="text-gray-400 text-sm">Une conception adaptée aux réalités réglementaires, financières et fiscales de la zone d&apos;Afrique Centrale.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10 px-4 border-t">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-serif font-bold text-[#0A1628]">Capilink</span>
            <span className="text-xs text-[#6B7280]">by Oriz Advisory SARL</span>
          </div>
          
          <div className="flex gap-6 text-sm text-[#6B7280]">
            <Link href="#" className="hover:text-[#0A1628]">Mentions Légales</Link>
            <Link href="#" className="hover:text-[#0A1628]">Confidentialité</Link>
            <Link href="#" className="hover:text-[#0A1628]">Contact</Link>
          </div>
          
          <div className="text-xs text-gray-400">
            © 2025 Oriz Advisory SARL — Yaoundé, Cameroun
          </div>
        </div>
      </footer>
    </div>
  );
}
