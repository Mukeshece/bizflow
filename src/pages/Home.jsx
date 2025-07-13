import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/api/entities';
import { LogIn, UserPlus, Zap } from 'lucide-react';

export default function HomePage() {
  const handleAuthAction = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Authentication failed", error);
      alert("Authentication failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      <div className="container mx-auto px-6 py-12 flex flex-col items-center justify-center text-center h-screen">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-slate-900">
            BizFlow
          </h1>
        </div>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl">
          The all-in-one GST billing and business management suite designed to simplify your operations and fuel your growth.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-6" onClick={handleAuthAction}>
            <LogIn className="mr-2 h-5 w-5" /> Sign In
          </Button>
          <Button size="lg" variant="outline" className="bg-white text-lg px-8 py-6" onClick={handleAuthAction}>
            <UserPlus className="mr-2 h-5 w-5" /> Sign Up
          </Button>
        </div>

        <div className="mt-12 text-slate-500 max-w-3xl">
          <p>Streamline your invoicing, manage inventory, track expenses, and gain valuable insights with our intuitive platform. Get started in minutes!</p>
        </div>
      </div>
    </div>
  );
}