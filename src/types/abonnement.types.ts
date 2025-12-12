export interface Abonnement {
    id: number;
    abonneId: number;
    nomAbonne: string;
    prenomAbonne: string;
    dateDebut: string;
    dateFin?: string;
    tarifId: number;
    peage: number;
    peageLabel: string;
    periodicityId: number;
    periodicity: string;
    abonneImmatriculation: string;
    actif: boolean;
    montant: number;
    typeCategories: string;
    immatriculationId: number;
    created_at?: string;
    updated_at?: string;

    // Informations supplémentaires pour l'affichage
    client?: {
        id: number;
        nom: string;
        prenom: string;
        numeroTelephone: string;
        localite: string;
        username: string;
        email: string;
        numeroCNIB: string;
        abonne: boolean;
    };

    tarifAbonnement?: {
        id: number;
        libelle: string;
        nbreEssieux?: number;
        periodelibelle: string;
        montant: number;
        categoryId: number;
    };
}

export interface AbonnementCreate {
    abonneId: number;
    peage: number;
    tarifId: number;
    dateDebut: string;
    abonneImmatriculation: string;
    periodicityId?: number;
}

export interface AbonnementUpdate extends AbonnementCreate {
    id: number;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
    status: number;
}

export class AbonnementValidator {
    static validate(abonnement: Partial<AbonnementCreate>): string[] {
        const errors: string[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Validation abonné
        if (!abonnement.abonneId) {
            errors.push("L'abonné est requis");
        }

        // Validation péage
        if (!abonnement.peage) {
            errors.push("Le péage est requis");
        }

        // Validation tarif d'abonnement
        if (!abonnement.tarifId) {
            errors.push("Le tarif d'abonnement est requis");
        }

        // Validation immatriculation
        if (!abonnement.abonneImmatriculation?.trim()) {
            errors.push("L'immatriculation est requise");
        } else if (abonnement.abonneImmatriculation.trim().length > 20) {
            errors.push("L'immatriculation ne peut pas dépasser 20 caractères");
        }

        // Validation date début
        if (!abonnement.dateDebut) {
            errors.push('La date de début est requise');
        } else {
            const dateDebut = new Date(abonnement.dateDebut);
            if (dateDebut < today) {
                errors.push('La date de début ne peut pas être dans le passé');
            }
        }

        return errors;
    }
}