// @/types/peage.types.ts
import { ApiResponse } from "./localite.types";

export interface Peage {
    id: number;
    codPeage: string;
    libPeage: string;
    locReel: number;
    libLoc: string;
}

export interface PeageCreateRequest {
    codPeage: string;
    libPeage: string;
    locReel: number;
}

export interface PeageUpdateRequest {
    id: number;
    codPeage?: string;
    libPeage?: string;
    locReel?: number;
}

export interface PeageApiResponse extends ApiResponse<Peage[]> { }

export class PeageValidator {
    static validateCodPeage(codPeage: string): boolean {
        if (!codPeage || typeof codPeage !== 'string') return false;
        const regex = /^\d{3}$/;
        if (!regex.test(codPeage)) return false;
        return codPeage !== "000";
    }

    static formatCodPeage(input: string | number): string {
        const numStr = input.toString().replace(/\D/g, '');
        if (numStr === '' || numStr === '0' || numStr === '00' || numStr === '000') {
            return '';
        }
        const num = parseInt(numStr, 10);
        if (num > 999) return '';
        return num.toString().padStart(3, '0');
    }

    static validateLibPeage(libPeage: string): boolean {
        return !!(libPeage && libPeage.trim().length > 0 && libPeage.trim().length <= 100);
    }

    static validateLocReel(locReel: number): boolean {
        return Number.isInteger(locReel) && locReel > 0;
    }
}

export interface PeageState {
    peages: Peage[];
    loading: boolean;
    selectedPeage: Peage | null;
    error: string | null;
}