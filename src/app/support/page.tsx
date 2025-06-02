import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-foreground">Support</h1>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center"><LifeBuoy className="mr-2 h-5 w-5 text-primary" /> Help & Support</CardTitle>
          <CardDescription>Find help resources, FAQs, and contact support.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg">
            <p className="text-muted-foreground">Support information and contact options will be displayed here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
