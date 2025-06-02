import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";

export default function QueuesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Queue Management</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><Share2 className="mr-2 h-5 w-5 text-primary" /> Current Queues</CardTitle>
          <CardDescription>Overview of all customer service queues.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">Queue Kanban Board or List will be displayed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
