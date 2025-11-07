export interface Abonne {
    id: number;
    nom: string;
    prenom: string;
    cnib: string;
    nbreTel: string;
    immatriculation: string;
    created_at?: string;
    updated_at?: string;
}

export interface AbonneCreate {
    nom: string;
    prenom: string;
    cnib: string;
    nbreTel: string;
    immatriculation: string;
}

export interface AbonneUpdate extends AbonneCreate {
    id: number;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
    status: number;
}

export class AbonneValidator {
    static validate(abonne: Partial<Abonne>, existingImatriculations: string[] = [], existingCnibs: string[] = []): string[] {
        const errors: string[] = [];

        // Validation nom
        if (!abonne.nom?.trim()) {
            errors.push('Le nom est requis');
        } else if (abonne.nom.trim().length > 50) {
            errors.push('Le nom ne peut pas dépasser 50 caractères');
        }

        // Validation prénom
        if (!abonne.prenom?.trim()) {
            errors.push('Le prénom est requis');
        } else if (abonne.prenom.trim().length > 50) {
            errors.push('Le prénom ne peut pas dépasser 50 caractères');
        }

        // Validation CNIB
        if (!abonne.cnib?.trim()) {
            errors.push('Le CNIB est requis');
        } else if (!abonne.cnib.startsWith('B')) {
            errors.push('Le CNIB doit commencer par B');
        } else if (abonne.cnib.trim().length > 20) {
            errors.push('Le CNIB ne peut pas dépasser 20 caractères');
        } else if (existingCnibs.includes(abonne.cnib.toLowerCase())) {
            errors.push("Un abonné avec ce CNIB existe déjà");
        }

        // Validation téléphone (suppression de la limite de caractères)
        if (!abonne.nbreTel?.trim()) {
            errors.push('Le numéro de téléphone est requis');
        } else if (!abonne.nbreTel.startsWith('+226')) {
            errors.push('Le numéro de téléphone doit commencer par +226');
        }

        // Validation immatriculation
        if (!abonne.immatriculation?.trim()) {
            errors.push("L'immatriculation est requise");
        } else if (abonne.immatriculation.trim().length > 20) {
            errors.push("L'immatriculation ne peut pas dépasser 20 caractères");
        } else if (existingImatriculations.includes(abonne.immatriculation.toLowerCase())) {
            errors.push("Un abonné avec cette immatriculation existe déjà");
        }

        return errors;
    }
}