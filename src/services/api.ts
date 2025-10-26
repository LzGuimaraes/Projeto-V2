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
  updateStatusReport: (numeroProjeto: string, statusReport: string) => Promise<Project>;
}

export const api: ApiService = {
  // ✅ Buscar todos os projetos
  getAllProjects: async () => {
    const url = `${API_BASE_URL}/all`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return response.json();
  },

  // ✅ Buscar por cliente ou número do projeto
  searchProjects: async (valor: string) => {
    const url = `${API_BASE_URL}/buscar/${valor}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    return response.json();
  },

  // ✅ Atualizar status report de um projeto
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
