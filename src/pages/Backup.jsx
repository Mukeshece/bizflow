import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { HardDrive, Download, Upload } from 'lucide-react';

export default function Backup() {
  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Backup & Restore</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive />
              Data Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-500">Secure your data by creating a backup. You can restore from a previous backup file.</p>
            <div className="flex justify-center gap-4">
              <Button size="lg"><Download className="mr-2 h-4 w-4" /> Create Backup</Button>
              <Button size="lg" variant="outline"><Upload className="mr-2 h-4 w-4" /> Restore from Backup</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}