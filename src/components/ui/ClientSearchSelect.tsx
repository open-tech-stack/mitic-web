"use client";

import { useState, useRef, useEffect } from "react";
import { Search, User, Phone, MapPin, UserCheck, IdCard, Mail } from "lucide-react";
import { Client } from "@/types/client.types";

interface ClientSearchSelectProps {
    clients: Client[];
    onClientSelect: (client: Client) => void;
    placeholder?: string;
    className?: string;
    selectedClient?: Client | null;
}

export default function ClientSearchSelect({
    clients,
    onClientSelect,
    placeholder = "Rechercher un client par nom, prénom, téléphone...",
    className = "",
    selectedClient = null
}: ClientSearchSelectProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filtrer les clients en fonction de la recherche
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredClients(clients.slice(0, 8)); // Afficher les 8 premiers par défaut
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = clients.filter(client =>
                client.nom.toLowerCase().includes(term) ||
                client.prenom.toLowerCase().includes(term) ||
                client.numeroTelephone.includes(term) ||
                client.username.toLowerCase().includes(term) ||
                client.localite?.toLowerCase().includes(term) ||
                client.email?.toLowerCase().includes(term)
            );
            setFilteredClients(filtered.slice(0, 8)); // Limiter à 8 résultats
        }
    }, [searchTerm, clients]);

    // Fermer le dropdown quand on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputFocus = () => {
        setIsOpen(true);
        if (searchTerm === "" && clients.length > 0) {
            setFilteredClients(clients.slice(0, 8));
        }
    };

    const handleClientSelect = (client: Client) => {
        onClientSelect(client);
        setSearchTerm(`${client.nom} ${client.prenom}`);
        setIsOpen(false);
    };

    const clearSelection = () => {
        onClientSelect(null as any);
        setSearchTerm("");
        inputRef.current?.focus();
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Input de recherche */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                {selectedClient && (
                    <button
                        onClick={clearSelection}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Dropdown des résultats */}
            {isOpen && filteredClients.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    {filteredClients.map((client) => (
                        <div
                            key={client.id}
                            onClick={() => handleClientSelect(client)}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${client.abonne ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                            <User className={`w-4 h-4 ${client.abonne ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'}`} />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-900 dark:text-white">
                                                {client.nom} {client.prenom}
                                            </h4>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3" />
                                                    {client.numeroTelephone}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {client.localite}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <IdCard className="w-3 h-3" />
                                            {client.numeroCNIB}
                                        </span>
                                        {client.email && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="w-3 h-3" />
                                                {client.email}
                                            </span>
                                        )}
                                        <span className={`px-2 py-1 rounded-full ${client.abonne ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                                            {client.abonne ? 'Abonné' : 'Ordinaire'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleClientSelect(client);
                                    }}
                                    className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Sélectionner
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Aucun résultat */}
            {isOpen && searchTerm.trim() !== "" && filteredClients.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                        Aucun client trouvé pour "{searchTerm}"
                    </p>
                </div>
            )}
        </div>
    );
}