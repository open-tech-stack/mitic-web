// @/components/dashboard/divers/pcg/pcgTree.tsx 
"use client";

import { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  TreePine,
  Folder,
  FolderOpen,
  FileText,
} from "lucide-react";
import { Pcg } from "@/types/pcg.types";

interface TreePcgProps {
  comptes: Pcg[];
  onEdit: (compte: Pcg) => void;
  onDelete: (compte: Pcg) => void;
  onAddChild: (parent: Pcg) => void;
  canCreate?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function TreePcg({
  comptes,
  onEdit,
  onDelete,
  onAddChild,
  canCreate = false,
  canUpdate = false,
  canDelete = false,
}: TreePcgProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (numeroCompte: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(numeroCompte)) {
      newExpanded.delete(numeroCompte);
    } else {
      newExpanded.add(numeroCompte);
    }
    setExpandedNodes(newExpanded);
  };

  const expandAll = () => {
    const allNumeros = new Set<string>();
    const collectAllNumeros = (nodes: Pcg[]) => {
      nodes.forEach(node => {
        allNumeros.add(node.numeroCompte);
        if (node.sousComptes && node.sousComptes.length > 0) {
          collectAllNumeros(node.sousComptes);
        }
      });
    };
    collectAllNumeros(comptes);
    setExpandedNodes(allNumeros);
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  // Fonction pour compter tous les descendants
  const countAllDescendants = (compte: Pcg): number => {
    let count = 0;
    const countRecursive = (node: Pcg) => {
      if (node.sousComptes) {
        node.sousComptes.forEach(child => {
          count++;
          countRecursive(child);
        });
      }
    };
    countRecursive(compte);
    return count;
  };

  // Fonction pour rendre un nœud avec une indentation simple
  const renderNode = (compte: Pcg, level: number = 0) => {
    const hasChildren = compte.sousComptes && compte.sousComptes.length > 0;
    const isExpanded = expandedNodes.has(compte.numeroCompte);
    const canDeleteCompte = canDelete && !hasChildren;
    const canEditCompte = canUpdate;

    return (
      <div key={compte.numeroCompte} className="relative">
        <div 
          className="flex items-center py-2 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors group border-l-4 border-transparent hover:border-blue-300"
          style={{ marginLeft: `${level * 24}px` }}
        >
          {/* Bouton d'expansion/réduction */}
          <button
            onClick={() => hasChildren && toggleNode(compte.numeroCompte)}
            className={`mr-3 p-1 rounded-lg flex-shrink-0 transition-all ${
              hasChildren
                ? "hover:bg-blue-100/50 dark:hover:bg-blue-800/30 text-blue-700 dark:text-blue-300 hover:scale-110"
                : "invisible"
            }`}
            disabled={!hasChildren}
          >
            {hasChildren && (
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : "rotate-0"
                }`}
              />
            )}
          </button>

          {/* Icône du type de nœud */}
          <div className={`p-2 rounded-xl mr-3 flex-shrink-0 transition-colors ${
            hasChildren 
              ? "bg-blue-200/30 dark:bg-blue-700/30" 
              : "bg-gray-200/30 dark:bg-gray-700/30"
          }`}>
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-700 dark:text-blue-300" />
              ) : (
                <Folder className="w-4 h-4 text-blue-700 dark:text-blue-300" />
              )
            ) : (
              <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </div>

          {/* Informations du compte */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono font-bold text-blue-900 dark:text-blue-100 text-base bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded border border-blue-200 dark:border-blue-700">
                {compte.numeroCompte}
              </span>
              <div className="font-medium text-blue-900 dark:text-blue-100 truncate flex-1">
                {compte.libelle}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {compte.classe && (
                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                  Classe: {compte.classe}
                </span>
              )}
              
              {hasChildren && (
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                  {compte.sousComptes.length} direct • {countAllDescendants(compte)} total
                </span>
              )}

              {compte.path && compte.path !== compte.numeroCompte && (
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  Compte : {compte.path}
                </span>
              )}
            </div>
          </div>

          {/* Actions - Conditionnées par les permissions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4">
            {/* Bouton Ajouter sous-compte */}
            {canCreate && (
              <button
                onClick={() => onAddChild(compte)}
                className="p-2 text-blue-600/70 hover:text-blue-700 dark:text-blue-400/70 dark:hover:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-lg transition-all hover:scale-110"
                title="Ajouter un sous-compte"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
            
            {/* Bouton Modifier */}
            {canEditCompte && (
              <button
                onClick={() => onEdit(compte)}
                className="p-2 text-green-600/70 hover:text-green-700 dark:text-green-400/70 dark:hover:text-green-300 hover:bg-green-100/50 dark:hover:bg-green-900/30 rounded-lg transition-all hover:scale-110"
                title="Modifier"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            
            {/* Bouton Supprimer */}
            {canDeleteCompte && (
              <button
                onClick={() => onDelete(compte)}
                className="p-2 text-red-600/70 hover:text-red-700 dark:text-red-400/70 dark:hover:text-red-300 hover:bg-red-100/50 dark:hover:bg-red-900/30 rounded-lg transition-all hover:scale-110"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            
            {/* Affichage si suppression impossible */}
            {canDelete && !canDeleteCompte && hasChildren && (
              <div className="p-2 text-gray-400 dark:text-gray-600 cursor-not-allowed" title="Impossible de supprimer (a des sous-comptes)">
                <Trash2 className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Sous-comptes */}
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-blue-200/30 dark:border-blue-700/30 ml-6">
            {compte.sousComptes.map((child) => 
              renderNode(child, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Les comptes racines sont ceux sans parent
  const rootComptes = comptes.filter(c => !c.parent);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-blue-200/30 dark:border-blue-700/30 p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100/50 dark:bg-blue-900/30">
            <TreePine className="w-6 h-6 text-blue-700 dark:text-blue-300" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
              Plan Comptable
            </h3>
            <p className="text-blue-600/70 dark:text-blue-400/70 text-sm mt-1">
              {rootComptes.length} arborescence(s) • {comptes.length} compte(s) total
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="flex items-center gap-2 px-4 py-2 text-blue-600/70 hover:text-blue-700 dark:text-blue-400/70 dark:hover:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-xl transition-colors border border-blue-200/30 dark:border-blue-700/30"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Tout développer</span>
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-2 px-4 py-2 text-blue-600/70 hover:text-blue-700 dark:text-blue-400/70 dark:hover:text-blue-300 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-xl transition-colors border border-blue-200/30 dark:border-blue-700/30"
          >
            <Folder className="w-4 h-4" />
            <span>Tout réduire</span>
          </button>
        </div>
      </div>

      <div className="tree-container max-h-[600px] overflow-y-auto rounded-xl border border-gray-200/30 dark:border-gray-700/30 bg-gray-50/50 dark:bg-gray-900/20 p-4">
        {rootComptes.length === 0 ? (
          <div className="text-center py-12 text-blue-600/70 dark:text-blue-400/70">
            <TreePine className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Aucun compte dans le plan comptable</p>
            <p className="text-sm">
              {canCreate 
                ? "Créez votre premier compte pour commencer." 
                : "Vous n'avez pas la permission de créer des comptes."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {rootComptes.map((compte) => renderNode(compte))}
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200/30 dark:border-blue-700/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {rootComptes.length}
            </div>
            <div className="text-sm text-blue-600/70 dark:text-blue-400/70">
              Arborescences
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {comptes.length}
            </div>
            <div className="text-sm text-green-600/70 dark:text-green-400/70">
              Total comptes
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {expandedNodes.size}
            </div>
            <div className="text-sm text-purple-600/70 dark:text-purple-400/70">
              Nœuds dépliés
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}