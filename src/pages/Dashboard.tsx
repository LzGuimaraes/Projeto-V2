import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Briefcase, TrendingUp } from 'lucide-react';
import { api, Project } from '../services/api';
import Header from '../components/Header';

const STATE_COLORS: Record<string, string> = {
  'trabalho em andamento': '#3B82F6', 
  'concluido': '#10B981',             
  'concluído': '#10B981',
  'cancelado': '#EF4444',             
  'aberto': '#8B5CF6',                
  'paralisado': '#F59E0B',            
  'pendente': '#6366F1'               
};

const PHASE_COLORS: Record<string, string> = {
  'inicio': '#A78BFA',
  'início': '#A78BFA',
  'planejamento': '#60A5FA',
  'execucao': '#34D399',
  'execução': '#34D399',
  'monitoramento': '#FBBF24',
  'controle': '#FBBF24',
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

  const normalizeText = (text: any) => {
    if (!text) return 'nao especificado';
    return String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  };

  const getColor = (originalName: string): string => {
    const cleanName = normalizeText(originalName);

    if (PHASE_COLORS[cleanName]) return PHASE_COLORS[cleanName];
    if (STATE_COLORS[cleanName]) return STATE_COLORS[cleanName];

    const phaseKey = Object.keys(PHASE_COLORS).find(key => cleanName.includes(key));
    if (phaseKey) return PHASE_COLORS[phaseKey];

    const stateKey = Object.keys(STATE_COLORS).find(key => cleanName.includes(key));
    if (stateKey) return STATE_COLORS[stateKey];

    return '#94A3B8';
  };

  const projectsByPhase = projects.reduce((acc, project) => {
    const fase = project.fase || 'Não especificado';
    acc[fase] = (acc[fase] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const phaseData: DataPoint[] = Object.entries(projectsByPhase).map(([name, value]) => ({
    name,
    value,
    color: getColor(name) 
  }));

  // Dados por ESTADO
  const projectsByState = projects.reduce((acc, project) => {
    const estado = project.estado || 'Não especificado';
    acc[estado] = (acc[estado] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const stateData: DataPoint[] = Object.entries(projectsByState).map(([name, value]) => ({
    name,
    value,
    color: getColor(name)
  }));

  // Dados por GERENTE
  const projectsByManager = projects.reduce((acc, project) => {
    const gerente = project.gerente || 'Não atribuído';
    acc[gerente] = (acc[gerente] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topManagers: ManagerData[] = Object.entries(projectsByManager)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const totalProjects = projects.length;
  
  const completedProjects = projects.filter(p => {
    const estado = (p.estado || '').toLowerCase();
    return estado.includes('conclui') || estado.includes('concluí');
  }).length;
  
  const totalManagers = Object.keys(projectsByManager).length;

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
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary">Dashboard de Projetos</h1>
          <p className="text-muted-foreground">Visão geral e análise dos projetos</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-muted-foreground">Cadastrados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedProjects}</div>
              <p className="text-xs text-muted-foreground">Finalizados</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gerentes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalManagers}</div>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="phase" className="space-y-4">
          <TabsList>
            <TabsTrigger value="phase">Por Fase</TabsTrigger>
            <TabsTrigger value="state">Por Estado</TabsTrigger>
            <TabsTrigger value="managers">Top Gerentes</TabsTrigger>
          </TabsList>

          {/* GRÁFICO DE BARRAS - FASES */}
          <TabsContent value="phase" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Fase</CardTitle>
                <CardDescription>Fase atual dos projetos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={phaseData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      fontSize={12} 
                      angle={-20} 
                      textAnchor="end" 
                      height={60}
                    />
                    <YAxis />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend />
                    <Bar dataKey="value" name="Quantidade de Projetos" radius={[4, 4, 0, 0]}>
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
          <TabsContent value="state" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={stateData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stateData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="managers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Gerentes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topManagers} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} fontSize={12} />
                    <Tooltip cursor={{ fill: 'transparent' }} />
                    <Legend />
                    <Bar dataKey="count" fill="#10b981" name="Projetos" radius={[0, 4, 4, 0]} />
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