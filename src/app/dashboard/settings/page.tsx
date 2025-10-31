import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Settings } from "lucide-react";
  
  export default function SettingsPage() {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings />
            Settings
          </CardTitle>
          <CardDescription>
              Manage your account and application settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p>User settings and preferences will be available here.</p>
        </CardContent>
      </Card>
    );
  }
  