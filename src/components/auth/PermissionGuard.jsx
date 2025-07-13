import React from 'react';
import { User } from '@/api/entities';
import { AlertTriangle, Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export function usePermissions() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.user_role === 'owner') return true;
    return user.permissions?.[permission] || false;
  };

  const isRole = (role) => {
    return user?.user_role === role;
  };

  return { user, loading, hasPermission, isRole };
}

export function PermissionGuard({ permission, children, fallback }) {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasPermission(permission)) {
    return fallback || (
      <Card className="m-6">
        <CardContent className="flex items-center justify-center p-8 text-center">
          <div>
            <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-500">You don't have permission to access this feature.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return children;
}

export default PermissionGuard;