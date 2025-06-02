
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Base de Conhecimento</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><BookOpen className="mr-2 h-5 w-5 text-primary" /> Artigos</CardTitle>
          <CardDescription>Gerencie e pesquise seus artigos da base de conhecimento.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">A Lista de Artigos da Base de Conhecimento e o Editor serão exibidos aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
