export interface Client {
    id: number;
    nom: string;
    prenom: string;
    localite: string;
    localiteId: number;
    userId: number;
    numeroTelephone: string;
    sexe: string;
    numeroCNIB: string;
    email: string;
    nomPersonneAContacter: string;
    prenomPersonneAContacter: string;
    numeroPersonneAContacter: string;
    username: string;
    password: string;
    abonne: boolean;
    immatriculation?: string; // Optionnel, seulement si abonné
    created_at?: string;
    updated_at?: string;
}

export interface ClientCreate {
    nom: string;
    prenom: string;
    localite: string;
    localiteId: number;
    userId: number;
    numeroTelephone: string;
    sexe: string;
    numeroCNIB: string;
    email: string;
    nomPersonneAContacter: string;
    prenomPersonneAContacter: string;
    numeroPersonneAContacter: string;
    username: string;
    password: string;
    abonne: boolean;
    immatriculation?: string;
}

export interface ClientUpdate extends ClientCreate {
    id: number;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
    status: number;
}

export class ClientValidator {
    static validate(client: Partial<Client>, existingCnibs: string[] = [], existingUsernames: string[] = [], existingEmails: string[] = []): string[] {
        const errors: string[] = [];

        // Validation nom
        if (!client.nom?.trim()) {
            errors.push('Le nom est requis');
        } else if (client.nom.trim().length > 50) {
            errors.push('Le nom ne peut pas dépasser 50 caractères');
        }

        // Validation prénom
        if (!client.prenom?.trim()) {
            errors.push('Le prénom est requis');
        } else if (client.prenom.trim().length > 50) {
            errors.push('Le prénom ne peut pas dépasser 50 caractères');
        }

        // Validation CNIB
        if (!client.numeroCNIB?.trim()) {
            errors.push('Le CNIB est requis');
        } else if (!client.numeroCNIB.startsWith('B')) {
            errors.push('Le CNIB doit commencer par B');
        } else if (client.numeroCNIB.trim().length > 20) {
            errors.push('Le CNIB ne peut pas dépasser 20 caractères');
        } else if (existingCnibs.includes(client.numeroCNIB.toLowerCase())) {
            errors.push("Un client avec ce CNIB existe déjà");
        }

        // Validation téléphone
        if (!client.numeroTelephone?.trim()) {
            errors.push('Le numéro de téléphone est requis');
        } else if (!client.numeroTelephone.startsWith('+226')) {
            errors.push('Le numéro de téléphone doit commencer par +226');
        }

        // Validation email
        if (client.email?.trim() && !this.isValidEmail(client.email)) {
            errors.push('Format d\'email invalide');
        } else if (client.email?.trim() && existingEmails.includes(client.email.toLowerCase())) {
            errors.push("Un client avec cet email existe déjà");
        }

        // Validation username
        if (!client.username?.trim()) {
            errors.push('Le nom d\'utilisateur est requis');
        } else if (existingUsernames.includes(client.username.toLowerCase())) {
            errors.push("Ce nom d'utilisateur est déjà utilisé");
        }

        // Validation password
        if (!client.password?.trim()) {
            errors.push('Le mot de passe est requis');
        } else if (client.password.length < 6) {
            errors.push('Le mot de passe doit contenir au moins 6 caractères');
        }

        // Validation immatriculation (seulement si abonné)
        if (client.abonne && !client.immatriculation?.trim()) {
            errors.push("L'immatriculation est requise pour un abonné");
        } else if (client.abonne && client.immatriculation && client.immatriculation.trim().length > 20) {
            errors.push("L'immatriculation ne peut pas dépasser 20 caractères");
        }

        return errors;
    }

    private static isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}