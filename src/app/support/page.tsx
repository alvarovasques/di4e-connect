
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Suporte</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><LifeBuoy className="mr-2 h-5 w-5 text-primary" /> Ajuda e Suporte</CardTitle>
          <CardDescription>Encontre recursos de ajuda, FAQs e entre em contato com o suporte.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">Informações de suporte e opções de contato serão exibidas aqui.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
