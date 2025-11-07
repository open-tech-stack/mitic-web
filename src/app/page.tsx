"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/guards/AuthGuard";

export default function Home() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gradient-to-br from-amber-900/10 via-gray-900 to-amber-800/5">
        {/* Header */}
        <header className="flex items-center justify-between p-6">
          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-xl bg-amber-600 flex items-center justify-center text-white font-bold text-xl">
              GP
            </div>
            <span className="text-amber-100 text-xl font-bold">
              Gestion Peages
            </span>
          </div>

          <Link
            href="/login"
            className="btn-primary flex items-center space-x-2"
          >
            <span>Se connecter</span>
            <ArrowRight size={16} />
          </Link>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-amber-100 mb-6">
              Système de vente de
              <span className="text-amber-400"> tickets de péage</span>
            </h1>

            <p className="text-xl text-amber-200/80 mb-10 max-w-2xl mx-auto">
              Solution professionnelle pour la gestion et la vente de tickets de
              péage. Accédez à votre espace pour gérer vos transactions en toute
              simplicité.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2"
              >
                <span>Commencer maintenant</span>
                <ArrowRight size={20} />
              </Link>

              <button className="px-8 py-4 rounded-xl border-2 border-amber-700/30 text-amber-200 hover:border-amber-600 transition-colors text-lg">
                En savoir plus
              </button>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <footer className="border-t border-amber-800/30 mt-20 py-10">
          <div className="container mx-auto px-6 text-center">
            <p className="text-amber-200/60">
              © {new Date().getFullYear()} Gestion Peages. Tous droits réservés.
            </p>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
