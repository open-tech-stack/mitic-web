// @/components/ui/Calculator.tsx

"use client";

import { useState } from "react";
import { Calculator as CalculatorIcon, Pi, SquareDot, Percent } from "lucide-react";

interface CalculatorProps {
    onButtonClick: (value: string) => void;
    onTypeSelect: (typeLibelle: string) => void;
    existingTypes: Array<{ libelle: string; calculable?: boolean }>;
    currentFormula: string;
}

export default function Calculator({
    onButtonClick,
    onTypeSelect,
    currentFormula
}: CalculatorProps) {
    const [display, setDisplay] = useState("0");

    const handleButtonClick = (value: string) => {
        onButtonClick(value);
        // Mise à jour du display local
        if (display === "0") {
            setDisplay(value);
        } else {
            setDisplay(prev => prev + value);
        }
    };

    const handleClear = () => {
        setDisplay("0");
        onButtonClick("");
    };

    const handleBackspace = () => {
        if (display.length > 1) {
            const newDisplay = display.slice(0, -1);
            setDisplay(newDisplay);
            onButtonClick(newDisplay);
        } else {
            setDisplay("0");
            onButtonClick("");
        }
    };

  

    return (
        <div className="calculator-container bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-amber-200/30 dark:border-amber-700/30 p-4">
            {/* Header */}
            <div className="calculator-header flex items-center gap-2 mb-4">
                <CalculatorIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                    Calculatrice
                </h3>
            </div>

            {/* Display */}
            <div className="calculator-display mb-4">
                <div className="bg-amber-50/50 dark:bg-amber-900/20 rounded-xl p-3 min-h-[60px]">
                    <div className="text-xs text-amber-600/70 dark:text-amber-400/70 mb-1">
                        Formule actuelle:
                    </div>
                    <div className="text-sm font-mono text-amber-900 dark:text-amber-100 break-all">
                        {currentFormula || "0"}
                    </div>
                </div>
            </div>
          
            {/* Clavier de la calculatrice */}
            <div className="calculator-keypad grid grid-cols-4 gap-2">
                {/* Première ligne */}
                <button
                    type="button"
                    onClick={() => handleButtonClick("(")}
                    className="operator-button p-3 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors font-medium"
                >
                    (
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick(")")}
                    className="operator-button p-3 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors font-medium"
                >
                    )
                </button>
                <button
                    type="button"
                    onClick={handleClear}
                    className="clear-button p-3 bg-red-100/50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200/50 dark:hover:bg-red-800/30 transition-colors font-medium"
                >
                    C
                </button>
                <button
                    type="button"
                    onClick={handleBackspace}
                    className="backspace-button p-3 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors font-medium"
                >
                    ⌫
                </button>

                {/* Deuxième ligne */}
                <button
                    type="button"
                    onClick={() => handleButtonClick("7")}
                    className="number-button p-3 bg-amber-50 dark:bg-gray-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                >
                    7
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("8")}
                    className="number-button p-3 bg-amber-50 dark:bg-gray-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                >
                    8
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("9")}
                    className="number-button p-3 bg-amber-50 dark:bg-gray-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                >
                    9
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("/")}
                    className="operator-button p-3 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors font-medium"
                >
                    ÷
                </button>

                {/* Troisième ligne */}
                <button
                    type="button"
                    onClick={() => handleButtonClick("4")}
                    className="number-button p-3 bg-amber-50 dark:bg-gray-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                >
                    4
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("5")}
                    className="number-button p-3 bg-amber-50 dark:bg-gray-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                >
                    5
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("6")}
                    className="number-button p-3 bg-amber-50 dark:bg-gray-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                >
                    6
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("*")}
                    className="operator-button p-3 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors font-medium"
                >
                    ×
                </button>

                {/* Quatrième ligne */}
                <button
                    type="button"
                    onClick={() => handleButtonClick("1")}
                    className="number-button p-3 bg-amber-50 dark:bg-gray-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                >
                    1
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("2")}
                    className="number-button p-3 bg-amber-50 dark:bg-gray-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                >
                    2
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("3")}
                    className="number-button p-3 bg-amber-50 dark:bg-gray-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                >
                    3
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("-")}
                    className="operator-button p-3 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors font-medium"
                >
                    -
                </button>

                {/* Cinquième ligne */}
                <button
                    type="button"
                    onClick={() => handleButtonClick("0")}
                    className="number-button p-3 bg-amber-50 dark:bg-gray-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                >
                    0
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick(".")}
                    className="number-button p-3 bg-amber-50 dark:bg-gray-700 text-amber-900 dark:text-amber-100 rounded-lg hover:bg-amber-100 dark:hover:bg-gray-600 transition-colors"
                >
                    .
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("+")}
                    className="operator-button p-3 bg-amber-100/50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200/50 dark:hover:bg-amber-800/30 transition-colors font-medium"
                >
                    +
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("=")}
                    className="equals-button p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                    =
                </button>

                {/* Fonctions spéciales */}
                <button
                    type="button"
                    onClick={() => handleButtonClick("%")}
                    className="function-button p-3 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors col-span-2 flex items-center justify-center gap-1"
                >
                    <Percent className="w-4 h-4" />
                    %
                </button>
                <button
                    type="button"
                    onClick={() => handleButtonClick("sqrt(")}
                    className="function-button p-3 bg-blue-100/50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200/50 dark:hover:bg-blue-800/30 transition-colors col-span-2 flex items-center justify-center gap-1"
                >
                    <SquareDot className="w-4 h-4" />
                    √
                </button>
            </div>
        </div>
    );
}