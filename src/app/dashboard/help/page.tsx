'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  FileText,
  Video,
  ChevronDown,
  ChevronUp,
  Search,
  Clock,
  User,
  CheckCircle
} from 'lucide-react'

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState('general')
  const [openItems, setOpenItems] = useState<number[]>([])



  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  const faqCategories = [
    {
      id: 'general',
      title: 'Général',
      icon: HelpCircle,
      questions: [
        {
          question: "Comment créer un compte ?",
          answer: "Pour créer un compte, cliquez sur 'S'inscrire' et remplissez le formulaire avec vos informations personnelles."
        },
        {
          question: "Comment réinitialiser mon mot de passe ?",
          answer: "Allez sur la page de connexion, cliquez sur 'Mot de passe oublié' et suivez les instructions envoyées par email."
        }
      ]
    },
    {
      id: 'payment',
      title: 'Paiements',
      icon: FileText,
      questions: [
        {
          question: "Quels modes de paiement sont acceptés ?",
          answer: "Nous acceptons Orange Money, Moov Money, et les cartes Visa/MasterCard."
        },
        {
          question: "Comment ajouter une méthode de paiement ?",
          answer: "Allez dans Paramètres → Paiement → Ajouter une méthode de paiement."
        }
      ]
    },
    {
      id: 'tickets',
      title: 'Tickets',
      icon: FileText,
      questions: [
        {
          question: "Comment acheter un ticket ?",
          answer: "Sélectionnez votre trajet, choisissez le nombre de tickets et procédez au paiement."
        },
        {
          question: "Comment utiliser mon ticket ?",
          answer: "Présentez le QR code à l'entrée du péage pour le faire scanner."
        }
      ]
    }
  ]

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      description: "Réponse sous 24h",
      details: "support@gestionpeages.com"
    },
    {
      icon: Phone,
      title: "Téléphone",
      description: "Disponible 24/7",
      details: "+226 25 45 65 85"
    },
    {
      icon: MessageCircle,
      title: "Chat en direct",
      description: "Réponse instantanée",
      details: "Cliquez sur l'icône de chat"
    }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">Centre d'aide</h1>
        <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
          Trouvez des réponses à vos questions ou contactez notre support
        </p>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-amber-600/70 dark:text-amber-400/70" />
          <input
            type="text"
            placeholder="Rechercher une question..."
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-700 border border-amber-200/30 dark:border-amber-700/30 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 dark:text-amber-100 placeholder-amber-600/60 dark:placeholder-amber-400/60"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-6 flex items-center">
              <HelpCircle className="mr-2 h-5 w-5" />
              Questions Fréquentes
            </h2>

            {/* Category Tabs */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {faqCategories.map((category) => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                      activeCategory === category.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-amber-100/50 hover:bg-amber-200/50 dark:bg-amber-900/30 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.title}</span>
                  </button>
                )
              })}
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
              {faqCategories
                .find(cat => cat.id === activeCategory)
                ?.questions.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full flex items-center justify-between p-4 text-left"
                    >
                      <span className="font-medium text-amber-900 dark:text-amber-100">
                        {item.question}
                      </span>
                      {openItems.includes(index) ? (
                        <ChevronUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      )}
                    </button>
                    
                    {openItems.includes(index) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4"
                      >
                        <p className="text-amber-600/70 dark:text-amber-400/70">
                          {item.answer}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="lg:col-span-1"
        >
          <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-6 flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              Contactez-nous
            </h2>

            <div className="space-y-4">
              {contactMethods.map((method, index) => {
                const Icon = method.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="p-2 bg-amber-600/20 rounded-lg">
                        <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-amber-900 dark:text-amber-100">
                          {method.title}
                        </h3>
                        <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
                          {method.description}
                        </p>
                      </div>
                    </div>
                    <p className="text-amber-700 dark:text-amber-300 font-medium">
                      {method.details}
                    </p>
                  </motion.div>
                )
              })}
            </div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="mt-6 p-4 bg-amber-600/10 rounded-xl border border-amber-600/20"
            >
              <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-300 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">Temps de réponse moyen</span>
              </div>
              <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                15 minutes
              </div>
              <div className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400 mt-1">
                <CheckCircle className="w-4 h-4" />
                <span>97% de satisfaction</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Video Tutorials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
        className="mt-6"
      >
        <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-6 flex items-center">
            <Video className="mr-2 h-5 w-5" />
            Tutoriels Vidéo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Premiers pas avec Gestion des peages", duration: "5:23" },
              { title: "Comment acheter un ticket", duration: "3:45" },
              { title: "Gérer vos paiements", duration: "4:12" }
            ].map((video, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative bg-amber-200/30 dark:bg-amber-800/30 rounded-xl aspect-video mb-3 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-amber-800/40 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Video className="w-6 h-6 text-amber-600" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <h3 className="font-medium text-amber-900 dark:text-amber-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {video.title}
                </h3>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}