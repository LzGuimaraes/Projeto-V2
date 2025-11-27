import { useState, useEffect, useCallback } from 'react';
import { api, Project } from '../services/api'; // Certifique-se de exportar 'Project' do api.ts

import Header from '../components/Header'; 
import SearchBar from '../components/SearchBar';
import ProjectCard from '../components/ProjectCard';

// Opções para os Dropdowns (Você pode ajustar conforme sua regra de negócio)
const ESTADOS = ["", "Pendente","Paralisado","Concluído" ,"Cancelado","Trabalho Em Andamento",  "Aberto"];
const FASES = ["", "Inicio", "Planejamento", "Execução", "Monitoramento/Controle","Entrega","Encerramento"];

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]); 
  const [loading, setLoading] = useState(true);          
  const [error, setError] = useState<string | null>(null); 
  
  // Estados dos Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedFase, setSelectedFase] = useState("");
  const [managerName, setManagerName] = useState("");

  // Função Unificada de Busca (O "Super Filtro")
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Chama o endpoint /filtrar passando todos os estados atuais
      const data = await api.filterProjects({
        busca: searchTerm,
        estado: selectedEstado,
        fase: selectedFase,
        gerente: managerName
      });

      // Garante que seja sempre um array
      const dataArray = Array.isArray(data) ? data : [data];
      setProjects(dataArray);
      
    } catch (err: any) {
      setError('Não foi possível carregar os projetos. Tente novamente mais tarde.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedEstado, selectedFase, managerName]);

  // Carrega ao iniciar
  useEffect(() => {
    loadProjects();
  }, []); 

  const handleSearch = () => {
    loadProjects();
  };

  const handleClear = () => {
    setSearchTerm("");
    setSelectedEstado("");
    setSelectedFase("");
    setManagerName("");
    
    api.filterProjects({ busca: "", estado: "", fase: "", gerente: "" })
      .then(data => setProjects(data))
      .catch(() => setError("Erro ao limpar filtros."));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Projetos Estratégicos
          </h1>
          
          <div className="mt-8 max-w-4xl mx-auto space-y-4">
            {/* Barra de Busca Principal */}
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm} 
              onSearch={handleSearch}       
              onClear={handleClear}         
            />

            {/* Área de Filtros Avançados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              
              {/* Filtro de Estado */}
              <select 
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-700"
              >
                <option value="">Todos os Estados</option>
                {ESTADOS.map((opt) => opt && <option key={opt} value={opt}>{opt}</option>)}
              </select>

              {/* Filtro de Fase */}
              <select 
                value={selectedFase}
                onChange={(e) => setSelectedFase(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-gray-700"
              >
                <option value="">Todas as Fases</option>
                {FASES.map((opt) => opt && <option key={opt} value={opt}>{opt}</option>)}
              </select>

              {/* Filtro de Gerente (Input de Texto) */}
              <input 
                type="text"
                placeholder="Filtrar por Gerente..."
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Botão extra para aplicar filtros (Opcional, pois o botão da SearchBar já busca) */}
            <div className="flex justify-end">
                <button 
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Aplicar Filtros
                </button>
            </div>
          </div>
        </section>

        <section className="mt-12">   
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-lg text-gray-500">Carregando projetos...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-center rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-lg text-gray-500">
                Nenhum projeto encontrado com os filtros selecionados.
              </p>
              <button 
                onClick={handleClear}
                className="mt-4 text-blue-600 hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}

          {!loading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {projects.map((project) => (
                <ProjectCard key={project.numeroProjeto} project={project} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;