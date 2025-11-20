import { useState, useEffect } from 'react';
import { api } from '../services/api';

import Header from '../components/Header.tsx'; 
import  SearchBar  from '../components/SearchBar.tsx';
import  ProjectCard  from '../components/ProjectCard.tsx';

export interface Project {
  numeroProjeto: string;
  nomeProjeto: string;
  gerente: string;
  cliente: string;
  fase: string;
  estado: string;
  porcentagemConclusao: number;
  dataInicio: string;
  dataTerminoAprovada: string;
  statusReport: string;
  nome?: string;
  status?: string;
  descricao?: string;
}

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([]); 
  const [loading, setLoading] = useState(true);          
  const [error, setError] = useState<string | null>(null); 
  const [searchMode, setSearchMode] = useState(false);      
  const [searchTerm, setSearchTerm] = useState("");        

  const fetchAllProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAllProjects();
      setProjects(Array.isArray(data) ? data : [data]);
      setSearchMode(false);
    } catch (err) {
      setError('Não foi possível carregar os projetos. Verifique se a API está rodando.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchProjects = async (valor: string) => {
    if (!valor.trim()) {
      fetchAllProjects();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await api.searchProjects(valor);
      const dataArray = Array.isArray(data) ? data : [data];
      setProjects(dataArray);
      setSearchMode(true);
      
      if (dataArray.length === 0) {
        setError(`Nenhum resultado encontrado para "${valor}".`);
      }
    } catch (err) {
      setError(`Erro ao buscar: ${err.message}`);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchSearchProjects(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm("");
    fetchAllProjects(); 
  };
  useEffect(() => {
    fetchAllProjects();
  }, []); 

  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <section className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            Gerencie e acompanhe seus projetos
          </h1>
          
          <div className="mt-8">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm} 
              onSearch={handleSearch}       
              onClear={handleClear}         
            />
          </div>
        </section>

        <section className="mt-12">   
          {/* ESTADO DE CARREGAMENTO */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">Carregando projetos...</p>
            </div>
          )}

          {/* ESTADO DE ERRO (e sem carregamento) */}
          {!loading && error && (
            <div className="text-center py-12">
              <p className="text-lg text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* SUCESSO, MAS SEM PROJETOS (e sem carregamento ou erro) */}
          {!loading && !error && projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-gray-500">
                {searchMode ? 'Nenhum projeto corresponde à sua busca.' : 'Nenhum projeto encontrado.'}
              </p>
            </div>
          )}

          {/* SUCESSO COM PROJETOS (e sem carregamento ou erro) */}
          {!loading && !error && projects.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              {projects.map((project) => (
                // Use 'numeroProjeto' como chave, que parece ser o ID único
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