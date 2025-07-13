import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, LayoutDashboard } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function OnboardingCompletion() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-xl border-t-4 border-green-500">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Setup Complete!</CardTitle>
          <p className="text-gray-600">Your business profile is ready. What would you like to do next?</p>
        </CardHeader>
        <CardContent className="space-y-4 p-8">
          <Link to={createPageUrl('CreateSalesInvoice')}>
            <Button className="w-full h-16 text-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-3">
              <ArrowRight className="w-5 h-5" />
              Create Your First Invoice
            </Button>
          </Link>
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="outline" className="w-full h-16 text-lg flex items-center justify-center gap-3">
              <LayoutDashboard className="w-5 h-5" />
              Skip & Go to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}