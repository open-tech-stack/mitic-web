// @/components/dashboard/divers/uo/treeUo.tsx
"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  TreePine,
  Folder,
  FolderOpen,
  User,
} from "lucide-react";
import { OrganizationalUnit } from "@/types/uo.types";

interface TreeUOProps {
  units: OrganizationalUnit[];
  onEdit: (unit: OrganizationalUnit) => void;
  onDelete: (unit: OrganizationalUnit) => void;
  onAddChild: (parent: OrganizationalUnit) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function TreeUO({
  units,
  onEdit,
  onDelete,
  onAddChild,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}: TreeUOProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (codeUo: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(codeUo)) {
      newExpanded.delete(codeUo);
    } else {
      newExpanded.add(codeUo);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allCodes = new Set(units.map((u) => u.codeUo));
    setExpandedNodes(allCodes);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const renderNode = (unit: OrganizationalUnit, level: number = 0) => {
    const hasChildren = unit.enfants && unit.enfants.length > 0;
    const isExpanded = expandedNodes.has(unit.codeUo);
    const canDeleteUnit = canDelete && !hasChildren;
    const canEditUnit = canUpdate && (!hasChildren || hasChildren);

    return (
      <div key={unit.codeUo} className="tree-node">
        <div
          className="flex items-center p-3 hover:bg-amber-50/30 dark:hover:bg-amber-900/10 rounded-xl transition-colors group"
          style={{ marginLeft: `${level * 24}px` }}
        >
          {/* Bouton d'expansion/réduction */}
          <button
            onClick={() => hasChildren && toggleNode(unit.codeUo)}
            className={`mr-2 p-1 rounded-lg flex-shrink-0 ${
              hasChildren
                ? "hover:bg-amber-100/50 dark:hover:bg-amber-800/30 text-amber-700 dark:text-amber-300"
                : "invisible"
            }`}
            disabled={!hasChildren}
          >
            {hasChildren && (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "rotate-0" : "-rotate-90"
                }`}
              />
            )}
          </button>

          {/* Icône du type de nœud */}
          <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30 mr-3 flex-shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              ) : (
                <Folder className="w-4 h-4 text-amber-700 dark:text-amber-300" />
              )
            ) : (
              <User className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            )}
          </div>

          {/* Informations de l'unité */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-amber-900 dark:text-amber-100 truncate">
              {unit.libUo}
              {!unit.parent && (
                <span className="ml-2 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                  Racine
                </span>
              )}
            </div>
            <div className="text-sm text-amber-600/70 dark:text-amber-400/70">
              {unit.codeUo}
            </div>
          </div>

          {/* Badges informatifs */}
          <div className="flex items-center gap-2 mr-3">
            {hasChildren && (
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                {unit.enfants.length} sous-unité(s)
              </span>
            )}
          </div>

          {/* Actions - Conditionnées par les permissions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Bouton Ajouter sous-unité */}
            {canCreate && (
              <button
                onClick={() => onAddChild(unit)}
                className="p-2 text-amber-600/70 hover:text-amber-700 dark:text-amber-400/70 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                title="Ajouter une sous-unité"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            
            {/* Bouton Modifier */}
            {canEditUnit && (
              <button
                onClick={() => onEdit(unit)}
                className="p-2 text-blue-600/70 hover:text-blue-700 dark:text-blue-400/70 dark:hover:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            
            {/* Bouton Supprimer */}
            {canDeleteUnit && (
              <button
                onClick={() => onDelete(unit)}
                className="p-2 text-red-600/70 hover:text-red-700 dark:text-red-400/70 dark:hover:text-red-300 hover:bg-red-100/50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            {/* Affichage si suppression impossible */}
            {canDelete && !canDeleteUnit && hasChildren && (
              <div className="p-2 text-gray-400 dark:text-gray-600 cursor-not-allowed" title="Impossible de supprimer (a des sous-unités)">
                <Trash2 className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Enfants */}
        {hasChildren && isExpanded && (
          <div className="node-children">
            {unit.enfants.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootUnits = units.filter((u) => !u.parent);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-amber-200/30 dark:border-amber-700/30 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
          <TreePine className="w-5 h-5 inline mr-2" />
          Vue Arborescente
        </h3>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1 text-sm text-amber-600/70 hover:text-amber-700 dark:text-amber-400/70 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
          >
            Tout déplier
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1 text-sm text-amber-600/70 hover:text-amber-700 dark:text-amber-400/70 dark:hover:text-amber-300 hover:bg-amber-100/50 dark:hover:bg-amber-900/30 rounded-xl transition-colors"
          >
            Tout replier
          </button>
        </div>
      </div>

      <div className="tree-container max-h-96 overflow-y-auto">
        {rootUnits.length === 0 ? (
          <div className="text-center py-8 text-amber-600/70 dark:text-amber-400/70">
            <TreePine className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucune unité organisationnelle</p>
            <p className="text-sm mt-1">
              {canCreate 
                ? "Créez votre première unité pour commencer" 
                : "Vous n'avez pas la permission de créer des unités"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {rootUnits.map((unit) => renderNode(unit))}
          </div>
        )}
      </div>
    </div>
  );
}