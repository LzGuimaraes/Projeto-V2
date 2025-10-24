const API_BASE_URL = 'https://projeto-backend-y1rx.onrender.com/projetos';

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
}

interface ApiService {
  getAllProjects: () => Promise<Project[]>;
  searchProjects: (valor: string) => Promise<Project[]>;
}

export const api: ApiService = {
  getAllProjects: async () => {
    const url = `${API_BASE_URL}/all`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      return data as Project[];

    } catch (error) {
      throw error; 
    }
  },

  searchProjects: async (valor) => {
    const url = `${API_BASE_URL}/buscar/${valor}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();

      return data as Project[];
      
    } catch (error) {
      throw error;
    }
  }
};
