// @/services/core/error-handler.service.ts

export interface AppError {
  message: string;
  code?: string;
  status?: number;
  type: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'UNKNOWN_ERROR';
  details?: any;
}

export class ErrorHandlerService {
  private static instance: ErrorHandlerService;
  
  public static getInstance(): ErrorHandlerService {
    if (!ErrorHandlerService.instance) {
      ErrorHandlerService.instance = new ErrorHandlerService();
    }
    return ErrorHandlerService.instance;
  }

  /**
   * Normalise les erreurs en un format standard
   */
  public normalizeError(error: any): AppError {
    if (!error) {
      return { 
        message: 'Erreur inconnue', 
        type: 'UNKNOWN_ERROR' 
      };
    }

    // Si c'est déjà une AppError
    if (this.isAppError(error)) {
      return error;
    }

    // Erreurs de réseau
    if (error.message?.includes('connexion') || 
        error.message?.includes('Failed to fetch') ||
        error.name === 'NetworkError' ||
        error.code === 'NETWORK_ERROR') {
      return {
        message: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
        type: 'NETWORK_ERROR',
        code: 'NETWORK_ERROR'
      };
    }

    // Erreurs HTTP avec status
    if (error.status) {
      switch (error.status) {
        case 400:
          return {
            message: error.message || 'Données invalides',
            type: 'VALIDATION_ERROR',
            status: 400,
            details: error.details
          };
        
        case 401:
          return {
            message: 'Session expirée. Veuillez vous reconnecter.',
            type: 'UNAUTHORIZED',
            status: 401
          };
        
        case 403:
          return {
            message: 'Accès non autorisé.',
            type: 'UNAUTHORIZED',
            status: 403
          };
        
        case 404:
          return {
            message: error.message || 'Ressource non trouvée',
            type: 'NOT_FOUND',
            status: 404
          };
        
        case 422:
          return {
            message: error.message || 'Données de validation incorrectes',
            type: 'VALIDATION_ERROR',
            status: 422,
            details: error.details
          };
        
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            message: 'Erreur du serveur. Veuillez réessayer plus tard.',
            type: 'SERVER_ERROR',
            status: error.status
          };
      }
    }

    // Erreurs de validation
    if (error.name === 'ValidationError' || error.type === 'VALIDATION_ERROR') {
      return {
        message: error.message || 'Données invalides',
        type: 'VALIDATION_ERROR',
        details: error.details
      };
    }

    // Timeout
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return {
        message: 'Délai d\'attente dépassé. Vérifiez votre connexion.',
        type: 'NETWORK_ERROR',
        code: 'TIMEOUT'
      };
    }

    // Par défaut
    return {
      message: error.message || 'Une erreur s\'est produite',
      type: 'UNKNOWN_ERROR',
      details: error
    };
  }

  /**
   * Vérifie si un objet est une AppError
   */
  private isAppError(error: any): error is AppError {
    return error && 
           typeof error.message === 'string' && 
           typeof error.type === 'string' &&
           ['NETWORK_ERROR', 'VALIDATION_ERROR', 'SERVER_ERROR', 'NOT_FOUND', 'UNAUTHORIZED', 'UNKNOWN_ERROR'].includes(error.type);
  }

  /**
   * Obtient un message d'erreur lisible pour l'utilisateur
   */
  public getUserMessage(error: AppError): string {
    switch (error.type) {
      case 'NETWORK_ERROR':
        return 'Problème de connexion. Vérifiez votre réseau et réessayez.';
      
      case 'UNAUTHORIZED':
        return 'Votre session a expiré. Veuillez vous reconnecter.';
      
      case 'NOT_FOUND':
        return 'L\'élément demandé n\'existe pas ou a été supprimé.';
      
      case 'VALIDATION_ERROR':
        return error.message || 'Les données saisies sont incorrectes.';
      
      case 'SERVER_ERROR':
        return 'Erreur du serveur. Veuillez réessayer dans quelques instants.';
      
      default:
        return error.message || 'Une erreur inattendue s\'est produite.';
    }
  }

  /**
   * Détermine si l'erreur nécessite une reconnexion
   */
  public requiresReauth(error: AppError): boolean {
    return error.type === 'UNAUTHORIZED' || error.status === 401;
  }

  /**
   * Détermine si l'erreur peut être réessayée
   */
  public isRetryable(error: AppError): boolean {
    return error.type === 'NETWORK_ERROR' || 
           error.type === 'SERVER_ERROR' ||
           (typeof error.status === 'number' && error.status >= 500);
  }

  /**
   * Log l'erreur de manière appropriée
   */
  public logError(error: AppError, context?: string): void {
    const logContext = context ? `[${context}]` : '';
    
    if (error.type === 'NETWORK_ERROR' || error.type === 'SERVER_ERROR') {
      console.error(`${logContext} Erreur système:`, {
        message: error.message,
        type: error.type,
        status: error.status,
        code: error.code
      });
    } else if (error.type === 'VALIDATION_ERROR') {
      console.warn(`${logContext} Erreur de validation:`, {
        message: error.message,
        details: error.details
      });
    } else {
      console.error(`${logContext} Erreur:`, error);
    }
  }
}