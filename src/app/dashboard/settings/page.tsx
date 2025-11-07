'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bell, 
  CreditCard, 
  Shield, 
  Globe, 
  Moon, 
  Sun,
  Download,
  Upload,
  Trash2,
  User,
  Mail,
  Phone,
  Save,
  X,
  Check,
  AlertCircle,
  HelpCircle,
  Palette
} from 'lucide-react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    sounds: true,
    vibration: true
  })
  const [theme, setTheme] = useState('light')
  const [language, setLanguage] = useState('fr')

 

  const handleNotificationChange = (key: string) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof notifications]
    }))
  }

  const paymentMethods = [
    { id: 1, type: 'Orange Money', number: '•••• •••• •••• 1234', default: true },
    { id: 2, type: 'Moov Money', number: '•••• •••• •••• 5678', default: false },
    { id: 3, type: 'Visa', number: '•••• •••• •••• 9012', default: false }
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
        <h1 className="text-3xl font-bold text-amber-900 dark:text-amber-100">Paramètres</h1>
        <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
          Personnalisez votre expérience Metic Agent selon vos préférences
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-1"
        >
          <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <nav className="space-y-2">
              {[
                { id: 'general', label: 'Général', icon: Globe },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'payment', label: 'Paiement', icon: CreditCard },
                { id: 'privacy', label: 'Confidentialité', icon: Shield },
                { id: 'appearance', label: 'Apparence', icon: Palette },
                { id: 'account', label: 'Compte', icon: User }
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                      activeTab === item.id
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'text-amber-700 dark:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-3"
        >
          <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            
            {/* General Settings */}
            {activeTab === 'general' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-6 flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Paramètres Généraux
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                      Langue
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 dark:text-amber-100"
                    >
                      <option value="fr">Français</option>
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
                      Synchronisation automatique
                    </label>
                    <div className="flex items-center space-x-3">
                      <div className="relative inline-block w-12 h-6">
                        <input type="checkbox" className="sr-only" defaultChecked />
                        <div className="w-12 h-6 bg-amber-600 rounded-full transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform transform translate-x-6"></div>
                      </div>
                      <span className="text-amber-700 dark:text-amber-300">Activée</span>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Sauvegarder</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-2 px-4 py-3 bg-amber-100/50 hover:bg-amber-200/50 dark:bg-amber-900/30 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-300 rounded-xl transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Restaurer</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-6 flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Paramètres de Notifications
                </h2>

                <div className="space-y-4">
                  {Object.entries(notifications).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30"
                    >
                      <div>
                        <h3 className="font-medium text-amber-900 dark:text-amber-100 capitalize">
                          {key.replace('_', ' ')}
                        </h3>
                        <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
                          Recevoir les notifications {key}
                        </p>
                      </div>
                      <div className="relative inline-block w-12 h-6">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={() => handleNotificationChange(key)}
                          className="sr-only"
                        />
                        <div
                          className={`w-12 h-6 rounded-full transition-colors ${
                            value ? 'bg-amber-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        ></div>
                        <div
                          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            value ? 'transform translate-x-6' : ''
                          }`}
                        ></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-6 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Méthodes de Paiement
                </h2>

                <div className="space-y-4 mb-6">
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-between p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-amber-600/20 rounded-xl flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-amber-900 dark:text-amber-100">
                            {method.type}
                          </h3>
                          <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
                            {method.number}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {method.default && (
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-lg">
                            Par défaut
                          </span>
                        )}
                        <button className="p-2 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Ajouter une méthode de paiement</span>
                </motion.button>
              </motion.div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-6 flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Apparence
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-4">
                      Thème
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'light', label: 'Clair', icon: Sun },
                        { id: 'dark', label: 'Sombre', icon: Moon }
                      ].map((themeOption) => {
                        const Icon = themeOption.icon
                        return (
                          <motion.button
                            key={themeOption.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setTheme(themeOption.id)}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              theme === themeOption.id
                                ? 'border-amber-600 bg-amber-100/50 dark:bg-amber-900/30'
                                : 'border-amber-200/30 dark:border-amber-700/30 hover:border-amber-300/50'
                            }`}
                          >
                            <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2" />
                            <span className="text-amber-900 dark:text-amber-100 font-medium">
                              {themeOption.label}
                            </span>
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-amber-900 dark:text-amber-100 mb-4">
                      Taille de texte
                    </label>
                    <div className="bg-amber-50/50 dark:bg-amber-900/20 rounded-xl p-4">
                      <input
                        type="range"
                        min="12"
                        max="18"
                        defaultValue="14"
                        className="w-full h-2 bg-amber-200/50 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-600"
                      />
                      <div className="flex justify-between text-xs text-amber-600/70 dark:text-amber-400/70 mt-2">
                        <span>Petit</span>
                        <span>Grand</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 pt-6 border-t border-amber-200/30 dark:border-amber-700/30"
            >
              <div className="flex space-x-4 justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-amber-100/50 hover:bg-amber-200/50 dark:bg-amber-900/30 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-300 rounded-xl transition-colors"
                >
                  Annuler
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Sauvegarder les modifications</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}