import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from '@/api/entities';
import { UploadFile } from '@/api/integrations';
import { Upload, Save, User as UserIcon } from 'lucide-react';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const handleFieldChange = (field, value) => {
    setUser(prev => ({ ...prev, [field]: value }));
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      try {
        const { file_url } = await UploadFile({ file });
        handleFieldChange('profile_picture_url', file_url);
      } catch (error) {
        console.error("Error uploading profile picture:", error);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await User.updateMyUserData({
        full_name: user.full_name,
        profile_picture_url: user.profile_picture_url,
      });
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error saving user profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!user) {
      return <div>Loading user profile...</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900">User Profile</h1>
            <Button onClick={handleSave} disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center">
                {user.profile_picture_url ? (
                  <img src={user.profile_picture_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <UserIcon className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <div>
                <Label htmlFor="profile-pic-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
                    <Upload className="w-4 h-4" />
                    Upload Picture
                  </div>
                </Label>
                <input
                  id="profile-pic-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                  className="hidden"
                />
                <p className="text-xs text-slate-500 mt-1">Recommended: 200x200px</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={user.full_name || ''}
                onChange={(e) => handleFieldChange('full_name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={user.email || ''}
                disabled
                className="bg-slate-100"
              />
              <p className="text-xs text-slate-500">Email address cannot be changed.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}