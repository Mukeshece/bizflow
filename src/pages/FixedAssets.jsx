import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export default function FixedAssetsPage() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Fixed Assets (FA)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <Construction className="w-16 h-16 text-slate-400 mb-4" />
            <h2 className="text-2xl font-semibold text-slate-700">Under Construction</h2>
            <p className="text-slate-500 mt-2">This feature is not yet available.</p>
        </CardContent>
      </Card>
    </div>
  );
}