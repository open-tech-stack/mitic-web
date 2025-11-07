export interface AbonnementTarif {
    id: number;
    categoryId: number;
    libelle: string; // Le type de véhicule (ex: "Poids Lourds")
    nbreEssieux?: number;
    montant: number;
    periodeId: number;
    periodelibelle: string; // La périodicité (ex: "PeriodeUnMois")
    created_at?: string;
    updated_at?: string;
}

// Interface pour l'envoi au backend
export interface AbonnementTarifCreateBackend {
    categoryId: number;
    periodeId: number;
    nbreEssieux?: number;
    montant: number;
}

// Interface pour le formulaire
export interface AbonnementTarifCreate {
    type: string;
    nombre_essieux?: number;
    periodicite: string;
    montant: number;
}

export interface AbonnementTarifUpdate extends AbonnementTarifCreate {
    id: number;
}

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
    status: number;
}

export interface CreationInfo {
    periodicityAbonnementDtos: Array<{
        id: number;
        periodicityName: string;
    }>;
    nbreEssieux: number[];
    categorieDto: Array<{
        id: number;
        libelle: string[];
    }>;
}

export class AbonnementTarifValidator {
    static validate(tarif: any, existingTarifs: any[] = []): string[] {
        const errors: string[] = [];

        // Validation type
        if (!tarif.type || tarif.type.trim() === '') {
            errors.push('Le type de véhicule est requis');
        }

        // Validation périodicité
        if (!tarif.periodicite || tarif.periodicite.trim() === '') {
            errors.push('La périodicité est requise');
        }

        // Validation montant
        if (!tarif.montant && tarif.montant !== 0) {
            errors.push('Le montant est requis');
        } else if (tarif.montant < 0) {
            errors.push('Le montant ne peut pas être négatif');
        } else if (tarif.montant > 1000000) {
            errors.push('Le montant ne peut pas dépasser 1 000 000');
        }

        // Validation nombre d'essieux pour poids lourds
        if (this.isPoidsLourd(tarif.type || '') && (!tarif.nombre_essieux || tarif.nombre_essieux < 2)) {
            errors.push('Le nombre d\'essieux est requis pour les poids lourds (minimum 2)');
        }

        return errors;
    }

    // Méthode pour détecter si un libellé correspond à un poids lourd (tolérant aux fautes)
    static isPoidsLourd(libelle: string): boolean {
        if (!libelle) return false;

        const cleanLibelle = libelle.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, '')
            .replace(/[^a-z]/g, '');

        return (
            cleanLibelle.includes('poidslourd') ||
            cleanLibelle.includes('poidlourd') ||
            cleanLibelle.includes('poidlour') ||
            cleanLibelle.includes('poidslor') ||
            cleanLibelle.includes('poidlor') ||
            cleanLibelle.includes('plourd') ||
            cleanLibelle.includes('plour') ||
            cleanLibelle.includes('pdlourd') ||
            cleanLibelle.includes('pdlour')
        );
    }
}