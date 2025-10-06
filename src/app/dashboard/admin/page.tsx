import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck />
          Admin Panel
        </CardTitle>
        <CardDescription>
            Admin-only section for managing the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>A comprehensive admin dashboard will be displayed here, allowing for approval of conversions, user management, and other administrative tasks.</p>
      </CardContent>
    </Card>
  );
}
