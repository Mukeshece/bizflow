import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X } from 'lucide-react';

const USER_ROLES = {
  owner: {
    name: 'Owner',
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

const PERMISSION_LABELS = {
  can_create_invoices: 'Create Invoices',
  can_edit_invoices: 'Edit Invoices',
  can_delete_invoices: 'Delete Invoices',
  can_view_reports: 'View Reports',
  can_manage_products: 'Manage Products',
  can_manage_parties: 'Manage Parties',
  can_manage_users: 'Manage Users',
  can_access_settings: 'Access Settings',
  can_manage_payments: 'Manage Payments',
  can_view_expenses: 'View Expenses',
  can_create_expenses: 'Create Expenses'
};

export default function RolePermissionsTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role Permissions Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Permission</th>
                {Object.entries(USER_ROLES).map(([key, role]) => (
                  <th key={key} className="text-center p-2">
                    <Badge className={role.color} variant="outline">
                      {role.name}
                    </Badge>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(PERMISSION_LABELS).map(([permission, label]) => (
                <tr key={permission} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{label}</td>
                  {Object.entries(USER_ROLES).map(([roleKey, role]) => (
                    <td key={roleKey} className="text-center p-2">
                      {role.permissions[permission] ? (
                        <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Role Descriptions</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(USER_ROLES).map(([key, role]) => (
              <div key={key} className="text-sm">
                <Badge className={role.color} variant="outline" className="mb-1">
                  {role.name}
                </Badge>
                <p className="text-gray-600">
                  {key === 'owner' && 'Complete control over all business operations and settings'}
                  {key === 'admin' && 'Manage daily operations, cannot manage users or some settings'}
                  {key === 'manager' && 'Supervise operations with limited delete permissions'}
                  {key === 'accountant' && 'Handle finances, payments, and financial reports'}
                  {key === 'employee' && 'Basic invoice creation with limited access'}
                  {key === 'viewer' && 'Read-only access to reports and expenses'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}