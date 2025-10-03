import { useState, useRef, useEffect } from "react";
import { ChevronsUpDown, Check } from "lucide-react";
import { Cidade } from "@/lib/types";



interface CustomComboboxProps {
  cidades: Cidade[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomCombobox({
  cidades,
  value,
  onChange,
  placeholder = "Selecione uma cidade",
}: CustomComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const comboboxRef = useRef<HTMLDivElement>(null);

  // Filtra cidades baseado no termo de busca
  const filteredCidades = cidades.filter((cidade) =>
    cidade.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fecha o combobox ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={comboboxRef}>
      {/* Input que simula o trigger do combobox */}
      <div
        className="flex items-center justify-between w-full p-2 border rounded-md cursor-pointer bg-background hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {value || placeholder}
        </span>
        <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50" />
      </div>

      {/* Dropdown (aparece quando isOpen = true) */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 border rounded-md shadow-lg bg-background">
          {/* Campo de busca */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Buscar cidade..."
              className="w-full p-1 outline-none bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          {/* Lista de resultados */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCidades.length === 0 ? (
              <div className="p-2 text-sm text-gray-500">Nenhuma cidade encontrada</div>
            ) : (
              filteredCidades.map((cidade) => (
                <div
                  key={cidade.id}
                  className={`p-2 cursor-pointer hover:bg-gray-100 ${
                    value === cidade.nome ? "bg-gray-100 font-medium" : ""
                  }`}
                  onClick={() => {
                    onChange(cidade.nome);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  <div className="flex items-center justify-between">
                    {cidade.nome}
                    {value === cidade.nome && <Check className="w-4 h-4" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}