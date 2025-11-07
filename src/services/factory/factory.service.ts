// @/services/factory/factory.service.ts
import { CategorieService } from "../categories/categorie/categorie.service";
import { CategorieTypeService } from "../categories/type/type-categorie.service";
import { TypeMontantService } from "../categories/typeMontant/type-montant.service";
import { CompteTypeService } from "../comptes/type/typeCompte.service";
import { LocaliteService } from "../localite/localite.service";
import { OperationMontantTypeService } from "../operations/operationMontantType/operationMontantType.service";
import { ModeReglementService } from "../operations/reglement/modeReglement.service";
import { SchemaComptableService } from "../operations/schemaComptables/schemaComptables.service";
import { TypeOperationService } from "../operations/type/typeOperation.service";
import { PeageService } from "../peage/peage.service";
import { TronconService } from "../troncon/troncon.service";
import { UserService } from "../user/user.service";
import { UoService } from "../uo/uo.service";
import { SecurityService } from "../security/security.service";
import { CompteService } from "../comptes/compte/compte.service";
import { HistoriqueCompteService } from "../comptes/historique/historique.service";
import { PcgService } from "../pcg/pcg.service";
import { AuthService } from "../auth/auth.service";
import { TokenService } from "../auth/token.service";
import { HttpService } from "../core/http.service";
import { SecureStorageService } from "../storage/storage.service";
import { CaisseService } from "../caissier/caissier.service";
import { AgentCaisseService } from "../agents/agent.service";
import { EtatCaisseService } from "../agents/etatCaisse.service";
import { AbonnementService } from "../abonnements/abonnement.service";
import { AbonneService } from "../abonnes/abonne.service";
import { AbonnementTarifService } from "../period-tarif/period-tarif.service";

/**
 * Factory pour créer et configurer les services
 */
export class ServiceFactory {
  private static httpServiceInstance: HttpService | null = null;
  private static authServiceInstance: AuthService | null = null;
  private static storageServiceInstance: SecureStorageService | null = null;
  private static tokenServiceInstance: TokenService | null = null;
  private static typeMontantServiceInstance: TypeMontantService | null = null;
  private static categorieServiceInstance: CategorieService | null = null;
  private static typeOperationServiceInstance: TypeOperationService | null = null;
  private static modeReglementServiceInstance: ModeReglementService | null = null;
  private static operationMontantTypeServiceInstance: OperationMontantTypeService | null = null;
  private static schemaComptableServiceInstance: SchemaComptableService | null = null;
  private static uoServiceInstance: UoService | null = null;
  private static pcgServiceInstance: PcgService | null = null;
  private static securityServiceInstance: SecurityService | null = null;
  private static compteServiceInstance: CompteService | null = null;
  private static caisseServiceInstance: CaisseService | null = null;
  private static historiqueCompteServiceInstance: HistoriqueCompteService | null = null;
  private static agentCaisseServiceInstance: AgentCaisseService | null = null;
  private static etatCaisseServiceInstance: EtatCaisseService | null = null;
  private static periodTarifServiceInstance: AbonnementTarifService | null = null;
  private static abonneServiceInstance: AbonneService | null = null;
  private static abonnementServiceInstance: AbonnementService | null = null;

  /**
   * Crée le service HTTP avec toutes ses dépendances
   */
  public static createHttpService(config: { baseUrl: string; timeout?: number }): HttpService {
    if (!ServiceFactory.httpServiceInstance) {
      const tokenService = ServiceFactory.createTokenService();
      const storageService = ServiceFactory.createStorageService();

      ServiceFactory.httpServiceInstance = HttpService.getInstance(
        config.baseUrl,
        config.timeout || 10000,
        tokenService,
        storageService
      );
    }
    return ServiceFactory.httpServiceInstance;
  }

  /**
   * Crée le service d'authentification avec toutes ses dépendances
   */
  public static createAuthService(config: { baseUrl: string; timeout?: number }): AuthService {
    if (!ServiceFactory.authServiceInstance) {
      const httpService = ServiceFactory.createHttpService(config);
      const storageService = ServiceFactory.createStorageService();
      const tokenService = ServiceFactory.createTokenService();

      ServiceFactory.authServiceInstance = AuthService.getInstance(
        httpService,
        storageService,
        tokenService
      );
    }
    return ServiceFactory.authServiceInstance;
  }

  /**
   * Crée le service de stockage
   */
  public static createStorageService(): SecureStorageService {
    if (!ServiceFactory.storageServiceInstance) {
      ServiceFactory.storageServiceInstance = SecureStorageService.getInstance();
    }
    return ServiceFactory.storageServiceInstance;
  }

  /**
   * Crée le service de tokens
   */
  public static createTokenService(): TokenService {
    if (!ServiceFactory.tokenServiceInstance) {
      ServiceFactory.tokenServiceInstance = TokenService.getInstance();
    }
    return ServiceFactory.tokenServiceInstance;
  }

  /**
   * Crée le service PCG
   */
  public static createPcgService(): PcgService {
    if (!ServiceFactory.pcgServiceInstance) {
      const httpService = ServiceFactory.createHttpService({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || ''
      });
      ServiceFactory.pcgServiceInstance = PcgService.getInstance(httpService);
    }
    return ServiceFactory.pcgServiceInstance;
  }

  /**
   * Crée le service de gestion des caisses
   */
  public static createCaisseService(): CaisseService {
    if (!ServiceFactory.caisseServiceInstance) {
      ServiceFactory.caisseServiceInstance = CaisseService.getInstance();
    }
    return ServiceFactory.caisseServiceInstance;
  }

  public static createPeriodTarifService(): AbonnementTarifService {
    if (!ServiceFactory.periodTarifServiceInstance) {
      ServiceFactory.periodTarifServiceInstance = AbonnementTarifService.getInstance();
    }
    return ServiceFactory.periodTarifServiceInstance;
  }



  /**
     * Crée le service d'état des caisses
     */
  public static createEtatCaisseService(): EtatCaisseService {
    if (!ServiceFactory.etatCaisseServiceInstance) {
      ServiceFactory.etatCaisseServiceInstance = EtatCaisseService.getInstance();
    }
    return ServiceFactory.etatCaisseServiceInstance;
  }


  public static createAbonneService(): AbonneService {
    if (!ServiceFactory.abonneServiceInstance) {
      ServiceFactory.abonneServiceInstance = AbonneService.getInstance();
    }
    return ServiceFactory.abonneServiceInstance;
  }

  public static createAbonnementService(): AbonnementService {
    if (!ServiceFactory.abonnementServiceInstance) {
      ServiceFactory.abonnementServiceInstance = AbonnementService.getInstance();
    }
    return ServiceFactory.abonnementServiceInstance;
  }
  /**
   * Crée le service des agents caissiers
   */
  public static createAgentCaisseService(): AgentCaisseService {
    if (!ServiceFactory.agentCaisseServiceInstance) {
      ServiceFactory.agentCaisseServiceInstance = AgentCaisseService.getInstance();
    }
    return ServiceFactory.agentCaisseServiceInstance;
  }

  /**
   * Réinitialise toutes les instances
   */
  public static resetAllInstances(): void {
    ServiceFactory.httpServiceInstance = null;
    ServiceFactory.authServiceInstance = null;
    ServiceFactory.storageServiceInstance = null;
    ServiceFactory.tokenServiceInstance = null;
    ServiceFactory.uoServiceInstance = null;
    ServiceFactory.securityServiceInstance = null;
    ServiceFactory.pcgServiceInstance = null;
    ServiceFactory.caisseServiceInstance = null;
    ServiceFactory.historiqueCompteServiceInstance = null;
    ServiceFactory.agentCaisseServiceInstance = null;
    ServiceFactory.etatCaisseServiceInstance = null;
    ServiceFactory.periodTarifServiceInstance = null;
    ServiceFactory.abonneServiceInstance = null;
    ServiceFactory.abonnementServiceInstance = null;
  }

  /**
   * Crée le service UO
   */
  public static createUoService(): UoService {
    if (!ServiceFactory.uoServiceInstance) {
      const httpService = ServiceFactory.createHttpService({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || ''
      });
      ServiceFactory.uoServiceInstance = UoService.getInstance(httpService);
    }
    return ServiceFactory.uoServiceInstance;
  }

  /**
   * Crée le service de sécurité
   */
  public static createSecurityService(): SecurityService {
    if (!ServiceFactory.securityServiceInstance) {
      const httpService = ServiceFactory.createHttpService({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || ''
      });
      ServiceFactory.securityServiceInstance = SecurityService.getInstance(httpService);
    }
    return ServiceFactory.securityServiceInstance;
  }

  public static getSecurityService(): SecurityService {
    if (!ServiceFactory.securityServiceInstance) {
      ServiceFactory.securityServiceInstance = ServiceFactory.createSecurityService();
    }
    return ServiceFactory.securityServiceInstance;
  }

  // Créer le service de type de compte
  public static createCompteTypeService(): CompteTypeService {
    return CompteTypeService.getInstance();
  }

  /**
   * Crée le service de comptes
   */
  public static createCompteService(): CompteService {
    if (!ServiceFactory.compteServiceInstance) {
      ServiceFactory.compteServiceInstance = CompteService.getInstance();
    }
    return ServiceFactory.compteServiceInstance;
  }

  /**
   * Crée le service d'historique de compte
   */
  public static createHistoriqueCompteService(): HistoriqueCompteService {
    if (!ServiceFactory.historiqueCompteServiceInstance) {
      ServiceFactory.historiqueCompteServiceInstance = HistoriqueCompteService.getInstance();
    }
    return ServiceFactory.historiqueCompteServiceInstance;
  }

  // Crée le service de localités
  public static createLocaliteService(): LocaliteService {
    return LocaliteService.getInstance();
  }

  /**
   * Crée le service de péages
   */
  public static createPeageService(): PeageService {
    return PeageService.getInstance();
  }

  // Créer le service de tronçon
  public static createTronconService(): TronconService {
    return TronconService.getInstance();
  }

  // Créer type de catégorie
  public static createCategorieTypeService(): CategorieTypeService {
    return CategorieTypeService.getInstance();
  }

  // Service pour les catégories
  public static createCategorieService(): CategorieService {
    if (!ServiceFactory.categorieServiceInstance) {
      ServiceFactory.categorieServiceInstance = CategorieService.getInstance();
    }
    return ServiceFactory.categorieServiceInstance;
  }

  // Service pour les types de montants
  public static createTypeMontantService(): TypeMontantService {
    if (!ServiceFactory.typeMontantServiceInstance) {
      ServiceFactory.typeMontantServiceInstance = TypeMontantService.getInstance();
    }
    return ServiceFactory.typeMontantServiceInstance;
  }

  // Créer le service de type d'opération
  public static createTypeOperationService(): TypeOperationService {
    if (!ServiceFactory.typeOperationServiceInstance) {
      ServiceFactory.typeOperationServiceInstance = TypeOperationService.getInstance();
    }
    return ServiceFactory.typeOperationServiceInstance;
  }

  // Créer le service de mode de règlement
  public static createModeReglementService(): ModeReglementService {
    if (!ServiceFactory.modeReglementServiceInstance) {
      ServiceFactory.modeReglementServiceInstance = ModeReglementService.getInstance();
    }
    return ServiceFactory.modeReglementServiceInstance;
  }

  // Créer le service d'association type opération - type montant
  public static createOperationMontantTypeService(): OperationMontantTypeService {
    if (!ServiceFactory.operationMontantTypeServiceInstance) {
      ServiceFactory.operationMontantTypeServiceInstance = OperationMontantTypeService.getInstance();
    }
    return ServiceFactory.operationMontantTypeServiceInstance;
  }

  // Créer le service de schéma comptable
  public static createSchemaComptableService(): SchemaComptableService {
    if (!ServiceFactory.schemaComptableServiceInstance) {
      ServiceFactory.schemaComptableServiceInstance = SchemaComptableService.getInstance();
    }
    return ServiceFactory.schemaComptableServiceInstance;
  }

  // Créer le service utilisateur
  public static createUserService(): UserService {
    return UserService.getInstance();
  }

  /**
   * Crée tous les services configurés pour l'application
   */
  public static createAppServices(config: { baseUrl: string; timeout?: number }) {
    const authService = ServiceFactory.createAuthService(config);
    const securityService = ServiceFactory.createSecurityService();
    const caisseService = ServiceFactory.createCaisseService();
    const agentCaisseService = ServiceFactory.createAgentCaisseService();
    const etatCaisseService = ServiceFactory.createEtatCaisseService();

    return {
      authService,
      securityService,
      caisseService,
      etatCaisseService,
      agentCaisseService,
      storageService: ServiceFactory.createStorageService(),
      tokenService: ServiceFactory.createTokenService(),
      httpService: ServiceFactory.createHttpService(config)
    };
  }
}