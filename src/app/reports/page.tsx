import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Reports & Analytics</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" /> Performance Reports</CardTitle>
          <CardDescription>View detailed reports and analytics for your customer service operations.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">Detailed reports and analytics will be displayed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
