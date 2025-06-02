
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function AiSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Configurações de IA</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Bot className="mr-2 h-5 w-5 text-primary" /> Configuração de IA</CardTitle>
          <CardDescription>Gerencie provedores LLM, prompts e o desempenho do agente de IA.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">As configurações e opções de configuração da IA serão exibidas aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
