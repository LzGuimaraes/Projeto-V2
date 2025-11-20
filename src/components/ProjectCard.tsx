import { useState, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../services/api";

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

interface ProjectCardProps {
  project: Project;
}

const statusConfig = {
  'Trabalho Em Andamento': { bg: 'rgba(251, 191, 36, 0.2)', text: 'rgb(217, 119, 6)', border: 'rgba(251, 191, 36, 0.4)' },
  'Concluído': { bg: 'rgba(74, 222, 128, 0.2)', text: 'rgb(22, 163, 74)', border: 'rgba(74, 222, 128, 0.4)' },
  'Cancelado': { bg: 'rgba(248, 113, 113, 0.2)', text: 'rgb(220, 38, 38)', border: 'rgba(248, 113, 113, 0.4)' },
  'Aberto': { bg: 'rgba(74, 222, 128, 0.2)', text: 'rgb(22, 163, 74)', border: 'rgba(74, 222, 128, 0.4)' },
  'Paralisado': { bg: 'rgba(148, 163, 184, 0.2)', text: 'rgb(71, 85, 105)', border: 'rgba(148, 163, 184, 0.4)' },
  'Pendente': { bg: 'rgba(96, 165, 250, 0.2)', text: 'rgb(37, 99, 235)', border: 'rgba(96, 165, 250, 0.4)' },
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusInput, setStatusInput] = useState(project.statusReport || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const status = statusConfig[project.fase] || statusConfig["Pendente"];

  const handleUpdateStatus = async () => {
    try {
      setIsUpdating(true);
      const updatedProject = await api.updateStatusReport(
        project.numeroProjeto,
        statusInput
      );
      project.statusReport = updatedProject.statusReport;
      setIsUpdating(false);
      alert("Status report atualizado com sucesso!");
    } catch (error) {
      setIsUpdating(false);
      console.error("Erro ao atualizar status:", error);
      alert("Falha ao atualizar status report.");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const descriptionText = project.statusReport.replace(
    /^(https?:\/\/[^\s]+)\s*/,
    ""
  ).trim();

  return (
    <div
      className={`bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:shadow-lg ${
        isExpanded ? "md:col-span-2" : ""
      }`}
    >
      {/* CABEÇALHO */}
      <div className="flex justify-between items-start mb-3 gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-1 break-words">
            {project.nomeProjeto}
          </h3>
          <p className="text-sm text-muted-foreground break-words">
            Cliente: {project.cliente}
          </p>
          <p className="text-sm text-muted-foreground break-words mt-1">
            Nº Projeto: {project.numeroProjeto}
          </p>
        </div>
        <Badge
          className="ml-3 whitespace-nowrap"
          style={{
            backgroundColor: status.bg,
            color: status.text,
            borderColor: status.border,
            borderWidth: "1px",
          }}
        >
          {project.fase}
        </Badge>
      </div>

      {/* DETALHES EXPANSÍVEIS */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isExpanded ? "max-h-[1200px] opacity-100 mt-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="space-y-4 border-t border-border pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-semibold text-foreground">Gerente</p>
              <p className="text-muted-foreground">{project.gerente}</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Início</p>
              <p className="text-muted-foreground">
                {formatDate(project.dataInicio)}
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Término Previsto</p>
              <p className="text-muted-foreground">
                {formatDate(project.dataTerminoAprovada)}
              </p>
            </div>
          </div>

          {/* STATUS REPORT EDITÁVEL */}
          <div>
            <p className="font-semibold text-foreground text-sm">Status Report</p>

            <textarea
              ref={textareaRef}
              value={statusInput}
              onChange={(e) => setStatusInput(e.target.value)}
              className="w-full mt-1 p-2 border border-border rounded-md text-sm resize-none"
              style={{
                minHeight: "120px",
                maxHeight: "24em",
                overflowY: "auto"
              }}
              placeholder="Nenhuma descrição fornecida."
            />


            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating || statusInput === project.statusReport}
              className="mt-2"
              size="sm"
            >
              {isUpdating ? "Atualizando..." : "Atualizar Status Report"}
            </Button>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-4 w-full justify-center gap-2 text-primary"
      >
        {isExpanded ? "Ver menos" : "Ver mais detalhes"}
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default ProjectCard;
