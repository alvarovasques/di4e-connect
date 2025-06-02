
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

export default function QueuesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Gerenciamento de Filas</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Share2 className="mr-2 h-5 w-5 text-primary" /> Filas Atuais</CardTitle>
          <CardDescription>Visão geral de todas as filas de atendimento ao cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">O Quadro Kanban ou Lista de Filas será exibido aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
