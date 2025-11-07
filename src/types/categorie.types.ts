// @/types/categorie.types.ts

export interface Categorie {
  id: number;
  typeCategorie: number;
  nbreEssieux: number;
  montant: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}

export class CategorieValidator {
  static validate(categorie: Partial<Categorie>, isPoidsLourd: boolean): string[] {
    const errors: string[] = [];
    
    // Validation type de catégorie
    if (categorie.typeCategorie === undefined || categorie.typeCategorie === null) {
      errors.push('Le type de catégorie est requis');
    }
    
    // Validation nombre d'essieux
    if (isPoidsLourd) {
      if (categorie.nbreEssieux === undefined || categorie.nbreEssieux === null || categorie.nbreEssieux < 1) {
        errors.push('Le nombre d\'essieux doit être au moins 1 pour un poids lourd');
      } else if (categorie.nbreEssieux > 20) {
        errors.push('Le nombre d\'essieux ne peut pas dépasser 20');
      }
    } else {
      // Pour les autres types, la modification se fera dans le service
      if (categorie.nbreEssieux && categorie.nbreEssieux > 0) {
        // Si une valeur a été saisie pour un non-poids lourd, on l'ignore silencieusement
        // ou on peut ajouter un avertissement
      }
    }
    
    // Validation montant
    if (categorie.montant === undefined || categorie.montant === null || categorie.montant < 25) {
      errors.push('Le montant doit être d\'au moins 25 FCFA');
    }
    
    return errors;
  }

  // Méthode pour détecter si un libellé correspond à un poids lourd (tolérant aux fautes)
  static isPoidsLourd(libelle: string): boolean {
    if (!libelle) return false;
    
    const cleanLibelle = libelle.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprime les accents
      .replace(/\s+/g, '') // Supprime les espaces AVANT de supprimer les autres caractères
      .replace(/[^a-z]/g, ''); // Puis supprime tout ce qui n'est pas une lettre
    
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