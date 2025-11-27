const API_BASE_URL = 'https://projeto-backend-y1rx.onrender.com';

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

export interface FilterParams {
  busca?: string;   
  estado?: string;
  fase?: string;
  gerente?: string;
}

interface ApiService {
  getAllProjects: () => Promise<Project[]>;
  filterProjects: (filters: FilterParams) => Promise<Project[]>;
  updateStatusReport: (numeroProjeto: string, statusReport: string) => Promise<Project>;
}

export const api: ApiService = {
  
  getAllProjects: async () => {
    const url = `${API_BASE_URL}/all`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return response.json();
  },

  filterProjects: async (filters: FilterParams) => {
   
    const params = new URLSearchParams();

    if (filters.busca) params.append('busca', filters.busca);
    if (filters.estado) params.append('estado', filters.estado);
    if (filters.fase) params.append('fase', filters.fase);
    if (filters.gerente) params.append('gerente', filters.gerente);

    const url = `${API_BASE_URL}/filtrar?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return response.json();
  },

  // Atualizar status report
  updateStatusReport: async (numeroProjeto: string, statusReport: string) => {
    const url = `${API_BASE_URL}/${numeroProjeto}/status-report`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statusReport })
    });

    if (!response.ok) {
      throw new Error(`Erro ao atualizar status report: ${response.status}`);
    }

    return response.json();
  }
};