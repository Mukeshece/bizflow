import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Plus, 
  Bell, 
  Settings, 
  MoreVertical,
  LogOut,
  UserCircle,
  HelpCircle,
  FileText,
  Download,
  Share2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { User as UserEntity } from '@/api/entities';

export default function Header({ user, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount] = useState(3); // Mock notification count
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to transactions page with search query
      navigate(createPageUrl(`Sales?search=${encodeURIComponent(searchQuery)}`));
    }
  };

  const handleLogout = async () => {
    try {
      await UserEntity.logout();
      if (onLogout) onLogout();
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-full">
        {/* Left Section - Search */}
        <div className="flex items-center gap-6 flex-1">
          <form onSubmit={handleSearch} className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search Transactions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </form>
        </div>

        {/* Right Section - Action Buttons & Menus */}
        <div className="flex items-center gap-3">
          {/* Add Sale Button */}
          <Link to={createPageUrl('CreateSalesInvoice')}>
            <Button className="bg-red-500 hover:bg-red-600 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Sale
            </Button>
          </Link>

          {/* Add Purchase Button */}
          <Link to={createPageUrl('CreatePurchaseInvoice')}>
            <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Purchase
            </Button>
          </Link>

          {/* Notification Bell */}
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                >
                  {notificationCount > 99 ? '99+' : notificationCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Settings */}
          <Link to={createPageUrl('Settings')}>
            <Button 
              variant="ghost" 
              size="icon"
              className="hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Button>
          </Link>

          {/* More Options Menu (Three Dots) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-gray-100 transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate(createPageUrl('UserProfile'))}>
                <UserCircle className="w-4 h-4 mr-2" />
                My Profile
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate(createPageUrl('CompanyProfile'))}>
                <Settings className="w-4 h-4 mr-2" />
                Company Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={() => navigate(createPageUrl('Reports'))}>
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate(createPageUrl('Backup'))}>
                <Download className="w-4 h-4 mr-2" />
                Backup & Export
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Share2 className="w-4 h-4 mr-2" />
                Share App
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Support
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}