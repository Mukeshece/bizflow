
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadFile } from '@/api/integrations';
import { User } from '@/api/entities';
import { Company } from '@/api/entities';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Upload, 
  Save, 
  Building, 
  Users, 
  Trash2, 
  Plus, 
  Shield,
  UserCheck,
  Settings,
  Eye,
  Edit,
  AlertTriangle,
  ArrowLeft,
  Home,
  X,
  Mail,
  UserPlus
} from 'lucide-react';

// Imported team management components
import InviteUserDialog from '../components/teams/InviteUserDialog';
import TeamMemberCard from '../components/teams/TeamMemberCard';
import RolePermissionsTable from '../components/teams/RolePermissionsTable';
import TeamStats from '../components/teams/TeamStats';

const USER_ROLES = {
  owner: {
    name: 'Owner',
    description: 'Full access to everything',
    color: 'bg-purple-100 text-purple-800',
    permissions: {
      can_create_invoices: true,
      can_edit_invoices: true,
      can_delete_invoices: true,
      can_view_reports: true,
      can_manage_products: true,
      can_manage_parties: true,
      can_manage_users: true,
      can_access_settings: true,
      can_manage_payments: true,
      can_view_expenses: true,
      can_create_expenses: true
    }
  },
  admin: {
    name: 'Admin',
    description: 'Manage business operations',
    color: 'bg-blue-100 text-blue-800',
    permissions: {
      can_create_invoices: true,
      can_edit_invoices: true,
      can_delete_invoices: true,
      can_view_reports: true,
      can_manage_products: true,
      can_manage_parties: true,
      can_manage_users: false,
      can_access_settings: true,
      can_manage_payments: true,
      can_view_expenses: true,
      can_create_expenses: true
    }
  },
  manager: {
    name: 'Manager',
    description: 'Supervise daily operations',
    color: 'bg-green-100 text-green-800',
    permissions: {
      can_create_invoices: true,
      can_edit_invoices: true,
      can_delete_invoices: false,
      can_view_reports: true,
      can_manage_products: true,
      can_manage_parties: true,
      can_manage_users: false,
      can_access_settings: false,
      can_manage_payments: true,
      can_view_expenses: true,
      can_create_expenses: true
    }
  },
  accountant: {
    name: 'Accountant',
    description: 'Handle financial transactions',
    color: 'bg-yellow-100 text-yellow-800',
    permissions: {
      can_create_invoices: true,
      can_edit_invoices: true,
      can_delete_invoices: false,
      can_view_reports: true,
      can_manage_products: false,
      can_manage_parties: true,
      can_manage_users: false,
      can_access_settings: false,
      can_manage_payments: true,
      can_view_expenses: true,
      can_create_expenses: true
    }
  },
  employee: {
    name: 'Employee',
    description: 'Basic access to create invoices',
    color: 'bg-indigo-100 text-indigo-800',
    permissions: {
      can_create_invoices: true,
      can_edit_invoices: false,
      can_delete_invoices: false,
      can_view_reports: false,
      can_manage_products: false,
      can_manage_parties: false,
      can_manage_users: false,
      can_access_settings: false,
      can_manage_payments: false,
      can_view_expenses: false,
      can_create_expenses: false
    }
  },
  viewer: {
    name: 'Viewer',
    description: 'View-only access',
    color: 'bg-gray-100 text-gray-800',
    permissions: {
      can_create_invoices: false,
      can_edit_invoices: false,
      can_delete_invoices: false,
      can_view_reports: true,
      can_manage_products: false,
      can_manage_parties: false,
      can_manage_users: false,
      can_access_settings: false,
      can_manage_payments: false,
      can_view_expenses: true,
      can_create_expenses: false
    }
  }
};

export default function CompanyProfile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [companyUsers, setCompanyUsers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: '', address: '', email: '', phone: '' });
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      setCurrentUser(user);

      const userCompanies = await Company.filter({ created_by: user.email });
      setCompanies(userCompanies);
      
      if (userCompanies.length > 0) {
        const active = userCompanies.find(c => c.id === user.active_company_id) || userCompanies[0];
        setActiveCompany(active);
      }

      // Load all users for the active company (in real app, you'd filter by company ID)
      const allUsers = await User.list(); 
      setCompanyUsers(allUsers || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleCompanyFieldChange = (field, value) => {
    setActiveCompany(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const { file_url } = await UploadFile({ file });
        handleCompanyFieldChange('logo_url', file_url);
      } catch (error) {
        console.error("Error uploading logo:", error);
      }
    }
  };

  const handleSaveCompany = async () => {
    if (!activeCompany) return;
    setIsSaving(true);
    try {
      await Company.update(activeCompany.id, activeCompany);
      alert('Company profile updated successfully!');
    } catch (error) {
      console.error('Error saving company:', error);
      alert('Failed to update company profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCompany = async () => {
    if (!newCompany.name) {
      alert('Company name is required');
      return;
    }
    
    try {
      const createdCompany = await Company.create(newCompany);
      await loadData();
      setShowAddCompanyForm(false);
      setNewCompany({ name: '', address: '', email: '', phone: '' });
      alert('Company added successfully!');
    } catch (error) {
      console.error('Error adding company:', error);
      alert('Failed to add company.');
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (companies.length <= 1) {
      alert('You cannot delete your only company. Create another company first.');
      return;
    }

    if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        await Company.delete(companyId);
        await loadData();
        alert('Company deleted successfully.');
      } catch (error) {
        console.error('Error deleting company:', error);
        alert('Failed to delete company.');
      }
    }
  };

  const handleUserRoleChange = async (userId, newRole) => {
    try {
      const roleConfig = USER_ROLES[newRole];
      // Check if this is a pending user (simulated client-side only pending users)
      if (userId.startsWith('pending_')) {
        setCompanyUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, user_role: newRole } : user
        ));
      } else {
        // Actual user update via API
        await User.update(userId, {
          user_role: newRole,
          permissions: roleConfig.permissions // Update permissions based on the new role
        });
        await loadData(); // Reload to get updated user list and permissions
      }
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role.');
    }
  };

  const handleInviteUser = async (inviteData) => {
    try {
      // In a real app, you'd make an API call to invite the user.
      // For this example, we simulate a pending user being added to the local state.
      const newPendingUser = {
        id: `pending_${Date.now()}`, // Client-side generated ID for pending users
        email: inviteData.email,
        full_name: `${inviteData.firstName} ${inviteData.lastName}`.trim(),
        user_role: inviteData.role,
        status: 'pending',
        invited_at: new Date().toISOString()
      };
      
      setCompanyUsers(prev => [...prev, newPendingUser]);
      setShowInviteDialog(false);
      alert(`Invitation sent to ${inviteData.email} with role ${USER_ROLES[inviteData.role].name}!`);
    } catch (error) {
      console.error('Error handling invite:', error);
      alert('Failed to send invitation.');
    }
  };

  const handleResendInvite = async (user) => {
    try {
      // Resend invitation logic would go here (e.g., API call to trigger email)
      alert(`Resending invitation to ${user.email}`);
      // Optionally update the invited_at timestamp for the pending user in local state
      setCompanyUsers(prev => prev.map(u => u.id === user.id ? { ...u, invited_at: new Date().toISOString() } : u));
    } catch (error) {
      console.error('Error resending invite:', error);
      alert('Failed to resend invitation.');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!confirm('Are you sure you want to remove this user?')) {
      return;
    }
    try {
      if (userId.startsWith('pending_')) {
        // Remove pending user from local state
        setCompanyUsers(prev => prev.filter(user => user.id !== userId));
      } else {
        // In a real app, you'd call an API to remove the user from the company/system
        await User.delete(userId); // Assuming User.delete can remove a user
        await loadData(); // Reload all users after removal
      }
      alert('User removed successfully');
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Failed to remove user');
    }
  };

  const canManageUsers = currentUser?.permissions?.can_manage_users || currentUser?.user_role === 'owner';
  // const canAccessSettings = currentUser?.permissions?.can_access_settings || currentUser?.user_role === 'owner'; // Not used directly in this file anymore

  if (!currentUser || !activeCompany) {
    return <div className="flex items-center justify-center h-screen text-lg font-medium text-slate-700">Loading company profile...</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header with Navigation */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Company Profile</h1>
              <p className="text-slate-500 mt-1">Manage your business information and team</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={USER_ROLES[currentUser.user_role]?.color || 'bg-gray-100'}>
              <Shield className="w-3 h-3 mr-1" />
              {USER_ROLES[currentUser.user_role]?.name || 'User'}
            </Badge>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(createPageUrl('Dashboard'))}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Company Details
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2" disabled={!canManageUsers}>
              <Users className="w-4 h-4" />
              Team Management
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              My Companies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                    {activeCompany.logo_url ? (
                      <img src={activeCompany.logo_url} alt="Company Logo" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Building className="w-10 h-10 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </div>
                    </Label>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <p className="text-xs text-slate-500 mt-1">Recommended: 200x200px</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={activeCompany.name || ''}
                      onChange={(e) => handleCompanyFieldChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={activeCompany.email || ''}
                      onChange={(e) => handleCompanyFieldChange('email', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={activeCompany.phone || ''}
                      onChange={(e) => handleCompanyFieldChange('phone', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={activeCompany.website || ''}
                      onChange={(e) => handleCompanyFieldChange('website', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gst_number">GST Number</Label>
                    <Input
                      id="gst_number"
                      value={activeCompany.gst_number || ''}
                      onChange={(e) => handleCompanyFieldChange('gst_number', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pan_number">PAN Number</Label>
                    <Input
                      id="pan_number"
                      value={activeCompany.pan_number || ''}
                      onChange={(e) => handleCompanyFieldChange('pan_number', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={activeCompany.address || ''}
                    onChange={(e) => handleCompanyFieldChange('address', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={activeCompany.city || ''}
                      onChange={(e) => handleCompanyFieldChange('city', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={activeCompany.state || ''}
                      onChange={(e) => handleCompanyFieldChange('state', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      value={activeCompany.pincode || ''}
                      onChange={(e) => handleCompanyFieldChange('pincode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveCompany} disabled={isSaving}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <TeamStats teamMembers={companyUsers} USER_ROLES={USER_ROLES} />
            
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Members ({companyUsers.length})
                  </CardTitle>
                  <Button onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyUsers.map((user) => (
                    <TeamMemberCard
                      key={user.id}
                      user={user}
                      currentUser={currentUser}
                      canManageUsers={canManageUsers}
                      onRoleChange={handleUserRoleChange}
                      onRemoveUser={handleRemoveUser}
                      onResendInvite={handleResendInvite}
                      USER_ROLES={USER_ROLES}
                    />
                  ))}
                  
                  {companyUsers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
                      <p className="text-gray-500 mb-4">Start building your team by inviting members</p>
                      <Button onClick={() => setShowInviteDialog(true)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Your First Member
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <RolePermissionsTable USER_ROLES={USER_ROLES} />
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Companies</CardTitle>
                  <Button 
                    size="sm"
                    onClick={() => setShowAddCompanyForm(!showAddCompanyForm)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Company
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAddCompanyForm && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">Add New Company</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Company Name *"
                        value={newCompany.name}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <Input
                        placeholder="Email"
                        value={newCompany.email}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, email: e.target.value }))}
                      />
                      <Input
                        placeholder="Phone"
                        value={newCompany.phone}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, phone: e.target.value }))}
                      />
                      <Textarea
                        placeholder="Address"
                        value={newCompany.address}
                        onChange={(e) => setNewCompany(prev => ({ ...prev, address: e.target.value }))}
                        className="md:col-span-2"
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowAddCompanyForm(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCompany}>
                        Add Company
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {companies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                          {company.logo_url ? (
                            <img src={company.logo_url} alt="Logo" className="w-full h-full rounded-lg object-cover" />
                          ) : (
                            <Building className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-gray-500">{company.email || 'No email set'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {company.id === activeCompany?.id && (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {companies.length > 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDeleteCompany(company.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <InviteUserDialog
          open={showInviteDialog}
          onClose={() => setShowInviteDialog(false)}
          companyName={activeCompany?.name || 'Your Company'}
          onInviteSent={handleInviteUser}
          USER_ROLES={USER_ROLES}
        />

        {/* Bottom Navigation */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate(createPageUrl('Settings'))}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              App Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
