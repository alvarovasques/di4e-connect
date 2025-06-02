
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Relatórios e Análises</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" /> Relatórios de Desempenho</CardTitle>
          <CardDescription>Visualize relatórios detalhados e análises para suas operações de atendimento ao cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">Relatórios e análises detalhados serão exibidos aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
