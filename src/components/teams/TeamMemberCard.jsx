import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MoreVertical, 
  Mail, 
  Trash2, 
  Shield, 
  User as UserIcon,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const USER_ROLES = {
  owner: { name: 'Owner', color: 'bg-purple-100 text-purple-800' },
  admin: { name: 'Admin', color: 'bg-blue-100 text-blue-800' },
  manager: { name: 'Manager', color: 'bg-green-100 text-green-800' },
  accountant: { name: 'Accountant', color: 'bg-yellow-100 text-yellow-800' },
  employee: { name: 'Employee', color: 'bg-indigo-100 text-indigo-800' },
  viewer: { name: 'Viewer', color: 'bg-gray-100 text-gray-800' }
};

const USER_STATUS = {
  active: { label: 'Active', icon: CheckCircle, color: 'text-green-600' },
  pending: { label: 'Pending Invite', icon: Clock, color: 'text-yellow-600' },
  inactive: { label: 'Inactive', icon: AlertCircle, color: 'text-gray-600' }
};

export default function TeamMemberCard({ 
  user, 
  currentUser, 
  onRoleChange, 
  onRemoveUser, 
  onResendInvite,
  canManageUsers 
}) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleRoleChange = async (newRole) => {
    setIsUpdating(true);
    try {
      await onRoleChange(user.id, newRole);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveUser = () => {
    if (confirm(`Are you sure you want to remove ${user.full_name || user.email} from the team?`)) {
      onRemoveUser(user.id);
    }
  };

  const status = user.status || 'active';
  const StatusIcon = USER_STATUS[status]?.icon || CheckCircle;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-400 to-slate-500 rounded-full flex items-center justify-center">
              {user.profile_picture_url ? (
                <img 
                  src={user.profile_picture_url} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">
                  {user.full_name || 'Unnamed User'}
                </h3>
                <StatusIcon className={`w-4 h-4 ${USER_STATUS[status]?.color}`} />
              </div>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={USER_ROLES[user.user_role || 'viewer']?.color} variant="outline">
                  <Shield className="w-3 h-3 mr-1" />
                  {USER_ROLES[user.user_role || 'viewer']?.name}
                </Badge>
                {status === 'pending' && (
                  <Badge variant="outline" className="text-yellow-600">
                    {USER_STATUS[status].label}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canManageUsers && user.id !== currentUser.id && (
              <>
                <Select
                  value={user.user_role || 'viewer'}
                  onValueChange={handleRoleChange}
                  disabled={isUpdating}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(USER_ROLES).map(([key, role]) => (
                      <SelectItem key={key} value={key}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {status === 'pending' && (
                      <>
                        <DropdownMenuItem onClick={() => onResendInvite(user)}>
                          <Mail className="w-4 h-4 mr-2" />
                          Resend Invitation
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={handleRemoveUser}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove from Team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            
            {user.id === currentUser.id && (
              <Badge variant="outline" className="text-blue-600">
                You
              </Badge>
            )}
          </div>
        </div>

        {user.last_login && (
          <div className="mt-3 text-xs text-gray-500">
            Last active: {new Date(user.last_login).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}