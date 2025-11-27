import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  XCircle, 
  PauseCircle, 
  AlertTriangle, 
  LayoutDashboard 
} from 'lucide-react';
import { api, Project } from '../services/api';
import Header from '../components/Header';

// --- CORES E CONSTANTES ---

// Mapeamento de cores para ESTADOS
const STATE_COLORS: Record<string, string> = {
  'trabalho em andamento': '#3B82F6',
  'concluido': '#10B981',
  'concluído': '#10B981',
  'cancelado': '#EF4444',
  'aberto': '#8B5CF6',
  'paralisado': '#F59E0B',
  'pendente': '#6366F1'
};

// Mapeamento de cores para FASES
const PHASE_COLORS: Record<string, string> = {
  'inicio': '#A78BFA',
  'início': '#A78BFA',
  'planejamento': '#60A5FA',
  'execucao': '#34D399',
  'execução': '#34D399',
  'monitoramento/controle': '#FBBF24',
  'entrega': '#F472B6',
  'encerramento': '#9CA3AF',
  'nao especificado': '#E5E7EB'
};

interface DataPoint {
  name: string;
  value: number;
  color: string;
}

interface ManagerData {
  name: string;
  count: number;
}

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAllProjects();
        setProjects(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError('Não foi possível carregar os dados do dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  // --- FUNÇÕES DE NORMALIZAÇÃO E COR ---

  // Converte para minúsculo e remove espaços extras
  const simpleNormalize = (text: any) => {
    if (!text || typeof text !== 'string' || text.trim() === '') return 'nao especificado';
    return text.toLowerCase().trim();
  };

  // Remove acentos de uma string
  const removeAccents = (text: string) => {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  // Busca a cor correta tentando com e sem acento
  const getColor = (originalName: string, type: 'phase' | 'state'): string => {
    const lowerName = simpleNormalize(originalName);
    const map = type === 'phase' ? PHASE_COLORS : STATE_COLORS;

    // 1. Tenta busca exata (ex: "concluído")
    if (map[lowerName]) return map[lowerName];

    // 2. Tenta busca sem acento (ex: "concluido")
    const noAccentName = removeAccents(lowerName);
    if (map[noAccentName]) return map[noAccentName];

    // 3. Cor padrão (cinza) se não encontrar
    return '#94A3B8';
  };

  // --- CÁLCULO DE MÉTRICAS (KPIs) ---

  const totalProjects = projects.length;

  // Função auxiliar para contar por estado
  const countByState = (targetStateNoAccent: string) => {
    return projects.filter(p => {
      // ATENÇÃO: Usando p.fase porque os dados estão invertidos no banco
      const estadoReal = simpleNormalize(p.fase); 
      const estadoSemAcento = removeAccents(estadoReal);
      return estadoSemAcento === targetStateNoAccent;
    }).length;
  };

  const completedProjects = countByState('concluido');
  const canceledProjects = countByState('cancelado');
  const pausedProjects = countByState('paralisado');

  // Lógica para Atrasados
  const delayedProjects = projects.filter(p => {
    // ATENÇÃO: Usando p.fase como estado real
    const estadoReal = simpleNormalize(p.fase);
    const estadoSemAcento = removeAccents(estadoReal);

    // Ignora projetos finalizados ou não iniciados
    if (['concluido', 'cancelado', 'nao especificado'].includes(estadoSemAcento)) {
      return false;
    }
    
    if (!p.dataTerminoAprovada) return false;

    const dataTermino = new Date(p.dataTerminoAprovada);
    const hoje = new Date();
    
    // Zera as horas para comparar apenas datas
    dataTermino.setHours(0,0,0,0);
    hoje.setHours(0,0,0,0);

    // Está atrasado se hoje for depois da data de término
    return hoje > dataTermino;
  }).length;

  // --- PREPARAÇÃO DOS DADOS DOS GRÁFICOS ---

  // Dados por FASE (Usando p.estado pois está invertido)
  const projectsByPhase = projects.reduce((acc, project) => {
    const faseReal = project.estado && project.estado.trim() !== '' ? project.estado : 'Não Especificado';
    acc[faseReal] = (acc[faseReal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const phaseData: DataPoint[] = Object.entries(projectsByPhase).map(([name, value]) => ({
    name,
    value,
    // Agora 'name' é uma fase real, busca no mapa de fases
    color: getColor(name, 'phase') 
  }));

  // Dados por ESTADO (Usando p.fase pois está invertido)
  const projectsByState = projects.reduce((acc, project) => {
    const estadoReal = project.fase && project.fase.trim() !== '' ? project.fase : 'Não Especificado';
    acc[estadoReal] = (acc[estadoReal] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stateData: DataPoint[] = Object.entries(projectsByState).map(([name, value]) => ({
    name,
    value,
    // Agora 'name' é um estado real, busca no mapa de estados
    color: getColor(name, 'state')
  }));

  // Dados por GERENTE (Top 5)
  const projectsByManager = projects.reduce((acc, project) => {
    const gerente = project.gerente && project.gerente.trim() !== '' ? project.gerente : 'Não Atribuído';
    acc[gerente] = (acc[gerente] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topManagers: ManagerData[] = Object.entries(projectsByManager)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen text-red-600">
          {error}
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      <Header />
      
      <div className="container mx-auto p-6 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard de Projetos</h1>
          <p className="text-gray-500">Visão geral dos indicadores de desempenho</p>
        </div>

        {/* --- CARDS DE KPIs --- */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* TOTAL */}
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Projetos</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{totalProjects}</div>
            </CardContent>
          </Card>

          {/* CONCLUÍDOS */}
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Concluídos</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{completedProjects}</div>
            </CardContent>
          </Card>

           {/* ATRASADOS */}
           <Card className="border-l-4 border-l-red-500 shadow-sm bg-red-50/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Atrasados</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{delayedProjects}</div>
            </CardContent>
          </Card>

          {/* PARALISADOS */}
          <Card className="border-l-4 border-l-orange-400 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Paralisados</CardTitle>
              <PauseCircle className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{pausedProjects}</div>
            </CardContent>
          </Card>

          {/* CANCELADOS */}
          <Card className="border-l-4 border-l-gray-400 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cancelados</CardTitle>
              <XCircle className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">{canceledProjects}</div>
            </CardContent>
          </Card>
        </div>

        {/* --- TABS COM GRÁFICOS --- */}
        <Tabs defaultValue="phase" className="space-y-4">
          <div className="flex justify-between items-center">
             <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
              <TabsTrigger value="phase">Por Fase</TabsTrigger>
              <TabsTrigger value="state">Por Estado</TabsTrigger>
              <TabsTrigger value="managers">Gerentes</TabsTrigger>
            </TabsList>
          </div>

          {/* GRÁFICO DE BARRAS - FASES */}
          <TabsContent value="phase" className="space-y-4 animate-in fade-in-50 duration-500">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Distribuição por Fase</CardTitle>
                <CardDescription>Visualização do volume de projetos em cada etapa</CardDescription>
              </CardHeader>
              <CardContent className="pl-0">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={phaseData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      tick={{fontSize: 12, fill: '#666'}} 
                      interval={0}
                      angle={-30} 
                      textAnchor="end"
                    />
                    <YAxis tick={{fontSize: 12, fill: '#666'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    />
                    <Bar dataKey="value" name="Qtd. Projetos" radius={[4, 4, 0, 0]}>
                      {phaseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GRÁFICO DE PIZZA - ESTADO */}
          <TabsContent value="state" className="space-y-4 animate-in fade-in-50 duration-500">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Status dos Projetos</CardTitle>
                <CardDescription>Proporção de estados dos projetos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={stateData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={130}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    >
                      {stateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* GRÁFICO - TOP GERENTES */}
          <TabsContent value="managers" className="space-y-4 animate-in fade-in-50 duration-500">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Top Gerentes</CardTitle>
                <CardDescription>Gerentes com maior volume de projetos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topManagers} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} horizontal={true} vertical={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={150} 
                      tick={{fontSize: 13, fill: '#333'}}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" barSize={20} radius={[0, 4, 4, 0]}>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;