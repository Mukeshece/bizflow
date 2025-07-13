import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark } from "lucide-react";

export default function LoanAccounts() {
  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Loan Accounts</h1>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-slate-500 text-lg">
              The Loan Accounts management feature is currently under development.
            </p>
            <p className="text-slate-400 mt-2">
              You will soon be able to track lenders, loans, EMIs, and interest payments right here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}