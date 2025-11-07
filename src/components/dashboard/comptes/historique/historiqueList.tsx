"use client";

import { Calendar, ArrowUpRight, ArrowDownLeft, Wallet, AlertTriangle, CreditCard } from "lucide-react";
import DataTable, { Column } from "@/components/ui/DataTable";
import { OperationHistorique } from "@/types/historiqueCompte.types";
import { ServiceFactory } from "@/services/factory/factory.service";

interface HistoriqueListProps {
  loading: boolean;
  operations: any[]; 
  soldeFinal: number;
}

export default function HistoriqueList({ loading, operations, soldeFinal }: HistoriqueListProps) {
  const historiqueService = ServiceFactory.createHistoriqueCompteService();

  // 🔧 DEBUG: Log des props reçues
  console.log('🔍 PROPS REÇUES - HistoriqueList:', {
    loading,
    operationsType: typeof operations,
    operationsIsArray: Array.isArray(operations),
    operationsLength: operations?.length || 0,
    operations: operations,
    soldeFinal
  });

  // Traitement des données pour créer les opérations individuelles
  let processedOperations: OperationHistorique[] = [];
  
  if (Array.isArray(operations) && operations.length > 0) {
    processedOperations = operations.map((item, index) => ({
      id: index + 1,
      date: item.date || item.dateDebut || '',
      sens: item.sens || 'DEBIT',
      montant: item.montant || 0,
      typeOp: item.typeOp || 'Opération',
      solde: item.soldeFinal || item.solde || 0
    }));
  }

  console.log('🔄 OPÉRATIONS TRAITÉES - HistoriqueList:', {
    processedOperationsCount: processedOperations.length,
    sample: processedOperations[0] || null
  });

  const { sens: sensFinal, classe: classeFinal } = historiqueService.getSensAffichage(soldeFinal);

  // Configuration des colonnes
  const columns: Column[] = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      width: "120px",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
          <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
            {historiqueService.formatDate(value as string)}
          </span>
        </div>
      ),
    },
    {
      key: "sens",
      label: "Sens",
      sortable: true,
      width: "100px",
      render: (value, row) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-lg text-sm font-medium ${
          value === 'DEBIT' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
            : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
        }`}>
          {value === 'DEBIT' ? (
            <ArrowUpRight className="w-3 h-3 mr-1" />
          ) : (
            <ArrowDownLeft className="w-3 h-3 mr-1" />
          )}
          {value}
        </span>
      ),
    },
    {
      key: "montant",
      label: "Montant",
      sortable: true,
      render: (value, row) => (
        <span className={`text-sm font-medium ${
          row.sens === 'DEBIT' 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {historiqueService.formatMontant(value as number)}
        </span>
      ),
    },
    {
      key: "typeOp",
      label: "Type d'opération",
      sortable: true,
      render: (value, row) => (
        <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-sm rounded-lg">
          {value}
        </span>
      ),
    },
    {
      key: "solde",
      label: "Solde",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
          <span className={`text-sm font-medium ${
            (value as number) >= 0 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {historiqueService.formatSolde(Math.abs(value as number))}
          </span>
        </div>
      ),
    },
  ];

  // Configuration du tableau
  const tableConfig = {
    selectable: false,
    pagination: true,
    searchable: true,
    pageSize: 10,
    pageSizes: [5, 10, 25, 50],
    actions: [],
    bulkActions: [],
  };

  return (
    <div className="historique-list-container-pro">
      {/* En-tête avec statistiques */}
      <div className="stats-header mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">Total opérations</p>
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {processedOperations.length}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <Calendar className="w-5 h-5 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">Débits</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {processedOperations.filter(op => op.sens === 'DEBIT').length}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-green-200/30 dark:bg-green-700/30">
                <ArrowUpRight className="w-5 h-5 text-green-700 dark:text-green-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">Crédits</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {processedOperations.filter(op => op.sens === 'CREDIT').length}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-red-200/30 dark:bg-red-700/30">
                <ArrowDownLeft className="w-5 h-5 text-red-700 dark:text-red-300" />
              </div>
            </div>
          </div>

          <div className="stat-card bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-4 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">Solde final</p>
                <p className={`text-2xl font-bold ${classeFinal}`}>
                  {historiqueService.formatSolde(Math.abs(soldeFinal))}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <CreditCard className="w-5 h-5 text-amber-700 dark:text-amber-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des données */}
      <DataTable
        data={processedOperations}
        columns={columns}
        config={tableConfig}
        loading={loading}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-amber-200/30 dark:border-amber-700/30"
      />

      {/* Solde final détaillé */}
      {processedOperations.length > 0 && (
        <div className="solde-final mt-6 p-6 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl border border-amber-200/30 dark:border-amber-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                <Wallet className="w-6 h-6 text-amber-700 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">Solde final du compte</p>
                <p className="text-amber-600/70 dark:text-amber-400/70 text-sm">
                  Calculé sur la période sélectionnée
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Sens: {sensFinal}</p>
              <p className={`text-2xl font-bold ${classeFinal}`}>
                {historiqueService.formatSolde(Math.abs(soldeFinal))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* État vide */}
      {!loading && processedOperations.length === 0 && (
        <div className="empty-state text-center py-12">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-amber-100/50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-600/70 dark:text-amber-400/70" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-amber-900 dark:text-amber-100 mb-2">
            Aucune opération trouvée
          </h3>
          <p className="text-amber-600/70 dark:text-amber-400/70">
            Aucune opération ne correspond à vos critères de recherche.
          </p>
        </div>
      )}
    </div>
  );
}