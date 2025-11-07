"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check,
  CheckSquare,
  Square,
  X,
} from "lucide-react";

// Types pour le composant Tableau
export interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  visible?: boolean;
   render?: (value: any, row: any, index: number) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TableAction {
  icon: React.ComponentType<any>;
  label: string;
  onClick: (row: any) => void;
  className?: string;
  condition?: (row: any) => boolean;
}

export interface TableConfig {
  selectable?: boolean;
  pagination?: boolean;
  searchable?: boolean;
  pageSize?: number;
  pageSizes?: number[];
  actions?: TableAction[];
  bulkActions?: TableAction[];
}

interface TableProps {
  data: any[];
  columns: Column[];
  config?: TableConfig;
  loading?: boolean;
  onSelectionChange?: (selectedRows: any[]) => void;
  className?: string;
}

export default function DataTable({
  data,
  columns,
  config = {},
  loading = false,
  onSelectionChange,
  className = "",
}: TableProps) {
  // Configuration par défaut
  const {
    selectable = true,
    pagination = true,
    searchable = true,
    pageSize = 10,
    pageSizes = [5, 10, 25, 50],
    actions = [],
    bulkActions = [],
  } = config;

  // États
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(pageSize);
  const [customPageSize, setCustomPageSize] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<Column[]>(columns);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Filtrer les données selon le terme de recherche
  const filteredData = data.filter(
    (item) =>
      item &&
      Object.values(item).some(
        (value) =>
          value != null &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  // Trier les données
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === bValue) return 0;

    if (sortConfig.direction === "asc") {
      return aValue < bValue ? -1 : 1;
    } else {
      return aValue > bValue ? -1 : 1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  // Gestion de la sélection
  const allSelected =
    paginatedData.length > 0 &&
    paginatedData.every((row) => selectedRows.includes(row));
  const someSelected =
    paginatedData.some((row) => selectedRows.includes(row)) && !allSelected;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedRows(
        selectedRows.filter((row) => !paginatedData.includes(row))
      );
    } else {
      const newSelected = [...new Set([...selectedRows, ...paginatedData])];
      setSelectedRows(newSelected);
    }
  };

  const toggleSelectRow = (row: any) => {
    if (selectedRows.includes(row)) {
      setSelectedRows(selectedRows.filter((r) => r !== row));
    } else {
      setSelectedRows([...selectedRows, row]);
    }
  };

  // Gestion du tri
  const handleSort = (key: string) => {
    if (sortConfig?.key === key) {
      if (sortConfig.direction === "asc") {
        setSortConfig({ key, direction: "desc" });
      } else {
        setSortConfig(null);
      }
    } else {
      setSortConfig({ key, direction: "asc" });
    }
  };

  // Gestion de la visibilité des colonnes
  const toggleColumnVisibility = (key: string) => {
    setVisibleColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
  };

  // Gestion de la pagination personnalisée
  const handleCustomPageSize = () => {
    const size = parseInt(customPageSize);
    if (!isNaN(size) && size >= 1) {
      setRowsPerPage(size);
      setCurrentPage(1);
      setCustomPageSize("");
    }
  };

  // Effet pour notifier les changements de sélection
  useEffect(() => {
    onSelectionChange?.(selectedRows);
  }, [selectedRows, onSelectionChange]);

  // Réinitialiser la pagination quand les données changent
  useEffect(() => {
    setCurrentPage(1);
  }, [data, searchTerm, rowsPerPage]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-200/30 dark:border-amber-700/30 ${className}`}
    >
      {/* Header avec contrôles */}
      <div className="p-4 border-b border-amber-200/30 dark:border-amber-700/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Recherche */}
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-600/70 dark:text-amber-400/70" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Contrôles */}
          <div className="flex items-center gap-2">
            {/* Sélecteur de colonnes */}
            <div className="relative">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="flex items-center gap-2 px-3 py-2 bg-amber-100/50 dark:bg-amber-900/30 border border-amber-200/30 dark:border-amber-700/30 rounded-xl hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Colonnes</span>
              </button>

              <AnimatePresence>
                {showColumnSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 border border-amber-200/30 dark:border-amber-700/30 rounded-xl shadow-lg z-50 min-w-[200px]"
                  >
                    <div className="p-3 border-b border-amber-200/30 dark:border-amber-700/30">
                      <h4 className="font-medium text-amber-900 dark:text-amber-100">
                        Colonnes visibles
                      </h4>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {columns.map((column) => (
                        <label
                          key={column.key}
                          className="flex items-center gap-3 p-3 hover:bg-amber-50/50 dark:hover:bg-amber-900/20 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns.some(
                              (c) => c.key === column.key && c.visible !== false
                            )}
                            onChange={() => toggleColumnVisibility(column.key)}
                            className="rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="text-sm text-amber-900 dark:text-amber-100">
                            {column.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions groupées */}
            {selectedRows.length > 0 && bulkActions.length > 0 && (
              <div className="flex items-center gap-2">
                {bulkActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => action.onClick(selectedRows)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors ${
                      action.className ||
                      "bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
                    }`}
                    title={action.label}
                  >
                    <action.icon className="w-4 h-4" />
                    <span className="hidden sm:block">{action.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info de sélection */}
        {selectedRows.length > 0 && (
          <div className="mt-3 flex items-center gap-3 text-sm text-amber-700 dark:text-amber-300">
            <Check className="w-4 h-4" />
            <span>{selectedRows.length} élément(s) sélectionné(s)</span>
            <button
              onClick={() => setSelectedRows([])}
              className="text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300"
            >
              Tout désélectionner
            </button>
          </div>
        )}
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-amber-200/30 dark:border-amber-700/30">
              {/* Checkbox de sélection */}
              {selectable && (
                <th className="p-3 w-12">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center justify-center w-6 h-6 rounded border border-amber-300 dark:border-amber-600 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 transition-colors"
                    title={
                      allSelected ? "Tout désélectionner" : "Tout sélectionner"
                    }
                  >
                    {allSelected ? (
                      <CheckSquare className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    ) : someSelected ? (
                      <div className="w-3 h-3 bg-amber-600 dark:bg-amber-400 rounded-sm" />
                    ) : (
                      <Square className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                    )}
                  </button>
                </th>
              )}

              {/* En-têtes de colonnes */}
              {visibleColumns
                .filter((column) => column.visible !== false)
                .map((column) => (
                  <th
                    key={column.key}
                    className={`p-3 text-left font-medium text-amber-900 dark:text-amber-100 ${
                      column.width ? `w-${column.width}` : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-2 ${
                        column.sortable ? "cursor-pointer" : ""
                      } ${
                        column.align === "center"
                          ? "justify-center"
                          : column.align === "right"
                          ? "justify-end"
                          : ""
                      }`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <span>{column.label}</span>
                      {column.sortable && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={`w-3 h-3 ${
                              sortConfig?.key === column.key &&
                              sortConfig.direction === "asc"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-amber-400 dark:text-amber-600"
                            }`}
                          />
                          <ChevronDown
                            className={`w-3 h-3 -mt-1 ${
                              sortConfig?.key === column.key &&
                              sortConfig.direction === "desc"
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-amber-400 dark:text-amber-600"
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}

              {/* Colonne d'actions */}
              {actions.length > 0 && (
                <th className="p-3 text-right font-medium text-amber-900 dark:text-amber-100 w-20">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {/* État de chargement */}
            {loading && (
              <tr>
                <td
                  colSpan={
                    (selectable ? 1 : 0) +
                    visibleColumns.filter((c) => c.visible !== false).length +
                    (actions.length > 0 ? 1 : 0)
                  }
                  className="p-8 text-center"
                >
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                  </div>
                </td>
              </tr>
            )}

            {/* Données */}
            {!loading && paginatedData.length === 0 && (
              <tr>
                <td
                  colSpan={
                    (selectable ? 1 : 0) +
                    visibleColumns.filter((c) => c.visible !== false).length +
                    (actions.length > 0 ? 1 : 0)
                  }
                  className="p-8 text-center text-amber-600/70 dark:text-amber-400/70"
                >
                  {searchTerm
                    ? "Aucun résultat trouvé"
                    : "Aucune donnée disponible"}
                </td>
              </tr>
            )}

            {!loading &&
              paginatedData.map((row, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  className={`border-b border-amber-100/50 dark:border-amber-800/30 hover:bg-amber-50/30 dark:hover:bg-amber-900/20 transition-colors ${
                    selectedRows.includes(row)
                      ? "bg-amber-100/30 dark:bg-amber-900/10"
                      : ""
                  }`}
                >
                  {/* Checkbox de sélection */}
                  {selectable && (
                    <td className="p-3">
                      <button
                        onClick={() => toggleSelectRow(row)}
                        className={`flex items-center justify-center w-5 h-5 rounded border ${
                          selectedRows.includes(row)
                            ? "border-amber-600 bg-amber-600 text-white"
                            : "border-amber-300 dark:border-amber-600 hover:border-amber-600 dark:hover:border-amber-400"
                        }`}
                      >
                        {selectedRows.includes(row) && (
                          <Check className="w-3 h-3" />
                        )}
                      </button>
                    </td>
                  )}

                  {/* Cellules de données */}
                  {visibleColumns
                    .filter((column) => column.visible !== false)
                    .map((column) => (
                      <td
                        key={column.key}
                        className={`p-3 text-amber-900 dark:text-amber-100 ${
                          column.align === "center"
                            ? "text-center"
                            : column.align === "right"
                            ? "text-right"
                            : ""
                        }`}
                      >
                        {column.render
                          ? column.render(row[column.key], row, index ?? 0)
                          : row[column.key]}
                      </td>
                    ))}

                  {/* Actions */}
                  {actions.length > 0 && (
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        {actions.map((action, actionIndex) => {
                          if (action.condition && !action.condition(row))
                            return null;

                          return (
                            <button
                              key={actionIndex}
                              onClick={() => action.onClick(row)}
                              className={`p-2 rounded-lg transition-colors ${
                                action.className ||
                                "text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
                              }`}
                              title={action.label}
                            >
                              <action.icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="p-4 border-t border-amber-200/30 dark:border-amber-700/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Informations de pagination */}
            <div className="text-sm text-amber-600/70 dark:text-amber-400/70">
              Affichage de {startIndex + 1} à{" "}
              {Math.min(startIndex + rowsPerPage, sortedData.length)} sur{" "}
              {sortedData.length} résultat(s)
            </div>

            {/* Contrôles de pagination */}
            <div className="flex items-center gap-4">
              {/* Sélecteur de nombre de lignes avec option personnalisée */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-amber-600/70 dark:text-amber-400/70">
                  Lignes par page:
                </span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-lg px-2 py-1 text-sm"
                >
                  {pageSizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>

                {/* Option personnalisée */}
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    value={customPageSize}
                    onChange={(e) => setCustomPageSize(e.target.value)}
                    placeholder="Custom"
                    className="w-16 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200/30 dark:border-amber-700/30 rounded-lg px-2 py-1 text-sm"
                  />
                  <button
                    onClick={handleCustomPageSize}
                    className="p-1 bg-amber-600 text-white rounded-md text-xs hover:bg-amber-700"
                  >
                    OK
                  </button>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
                  title="Première page"
                ></button>

                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
                  title="Page précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-sm ${
                          currentPage === pageNum
                            ? "bg-amber-600 text-white"
                            : "text-amber-600/70 dark:text-amber-400/70 hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <span className="px-2 text-amber-600/70 dark:text-amber-400/70">
                      ...
                    </span>
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
                  title="Page suivante"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-amber-600/70 dark:text-amber-400/70 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
                  title="Dernière page"
                ></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
