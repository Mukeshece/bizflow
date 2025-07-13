import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PasscodeDialog from './PasscodeDialog';
import { AppSettings } from '@/api/entities';

export default function GeneralSettings({ settings, onSettingChange, activeCompany }) {
  const navigate = useNavigate();
  const [showPasscodeDialog, setShowPasscodeDialog] = useState(false);

  const handlePasscodeSwitch = (checked) => {
    if (checked) {
      setShowPasscodeDialog(true);
    } else {
      onSettingChange('enable_passcode', false);
      onSettingChange('passcode', '');
    }
  };

  const handlePasscodeSet = (passcode) => {
    onSettingChange('enable_passcode', true);
    onSettingChange('passcode', passcode);
    setShowPasscodeDialog(false);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building className="w-5 h-5" />
            Business Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Manage your main business information, logo, and address.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate(createPageUrl('CompanyProfile'))}
          >
            Go to Company Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="w-5 h-5" />
            App Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="enable_passcode" className="font-medium">
              Enable Passcode Lock
            </Label>
            <Switch
              id="enable_passcode"
              checked={settings.enable_passcode || false}
              onCheckedChange={handlePasscodeSwitch}
            />
          </div>
          {settings.enable_passcode && (
            <p className="text-sm text-gray-500 mt-2">
              Passcode is enabled.
              <Button variant="link" className="p-0 h-auto ml-1" onClick={() => setShowPasscodeDialog(true)}>
                Change Passcode
              </Button>
            </p>
          )}
        </CardContent>
      </Card>
      
      <PasscodeDialog
        open={showPasscodeDialog}
        onClose={() => setShowPasscodeDialog(false)}
        onPasscodeSet={handlePasscodeSet}
      />

      <Card>
        <CardHeader>
          <CardTitle>Other Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Screen Zoom</Label>
            <Select
              value={String(settings.screen_zoom_scale || 90)}
              onValueChange={(value) => onSettingChange('screen_zoom_scale', Number(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="80">80%</SelectItem>
                <SelectItem value="90">90%</SelectItem>
                <SelectItem value="100">100%</SelectItem>
                <SelectItem value="110">110%</SelectItem>
                <SelectItem value="125">125%</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">Adjust the zoom level of the application interface.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}