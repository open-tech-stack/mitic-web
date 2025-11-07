

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
    abonneImmatriculation: string;
    actif: boolean;
    montant: number;
    typeCategories: string;
    created_at?: string;
    updated_at?: string;

    // Jointures optionnelles pour l'affichage
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