import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
}

const SearchBar = ({ searchTerm, onSearchChange, onSearch, onClear }: SearchBarProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-3xl mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input
          type="text"
          placeholder="Buscar por número de projeto ou cliente"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 h-12 bg-card border-border"
        />
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={onSearch}
          className="flex-1 sm:flex-none h-12 px-6"
        >
          Buscar
        </Button>
        <Button 
          variant="outline"
          onClick={onClear}
          className="flex-1 sm:flex-none h-12 px-6"
        >
          <X className="h-4 w-4 mr-2" />
          Limpar
        </Button>
      </div>
    </div>
  );
};

export default SearchBar;
