// @/services/categorie-type/categorie-type.types.ts
export interface CategorieType {
  id: number;
  libelle: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
  status: number;
}