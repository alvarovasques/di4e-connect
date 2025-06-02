import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

export default function AiSettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">AI Settings</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Bot className="mr-2 h-5 w-5 text-primary" /> AI Configuration</CardTitle>
          <CardDescription>Manage LLM providers, prompts, and AI agent performance.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">AI Settings and Configuration options will be displayed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
