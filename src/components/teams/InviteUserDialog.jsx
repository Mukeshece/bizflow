import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SendEmail } from '@/api/integrations';
import { Mail, UserPlus } from 'lucide-react';

const USER_ROLES = {
  owner: { name: 'Owner', description: 'Full access to everything' },
  admin: { name: 'Admin', description: 'Manage business operations' },
  manager: { name: 'Manager', description: 'Supervise daily operations' },
  accountant: { name: 'Accountant', description: 'Handle financial transactions' },
  employee: { name: 'Employee', description: 'Basic access to create invoices' },
  viewer: { name: 'Viewer', description: 'View-only access' }
};

export default function InviteUserDialog({ open, onClose, companyName, onInviteSent }) {
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'employee',
    firstName: '',
    lastName: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!inviteData.email) {
      alert('Email is required');
      return;
    }

    setIsSending(true);
    try {
      const inviteMessage = `
Hello ${inviteData.firstName || 'there'},

You've been invited to join ${companyName} on BizFlow as a ${USER_ROLES[inviteData.role].name}.

${inviteData.message ? `Personal message: ${inviteData.message}` : ''}

Role: ${USER_ROLES[inviteData.role].name}
Description: ${USER_ROLES[inviteData.role].description}

To accept this invitation:
1. Sign up or log in to BizFlow
2. You'll be automatically added to the ${companyName} team
3. Start collaborating with your team

Best regards,
BizFlow Team
      `;

      await SendEmail({
        to: inviteData.email,
        subject: `You're invited to join ${companyName} on BizFlow`,
        body: inviteMessage,
        from_name: companyName
      });

      alert('Invitation sent successfully!');
      onInviteSent && onInviteSent(inviteData);
      setInviteData({ email: '', role: 'employee', firstName: '', lastName: '', message: '' });
      onClose();
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Team Member
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={inviteData.firstName}
                onChange={(e) => setInviteData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="John"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={inviteData.lastName}
                onChange={(e) => setInviteData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={inviteData.email}
              onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={inviteData.role} onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(USER_ROLES).map(([key, role]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-xs text-gray-500">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              value={inviteData.message}
              onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Welcome to our team! Looking forward to working with you."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSending}>
              <Mail className="w-4 h-4 mr-2" />
              {isSending ? 'Sending...' : 'Send Invitation'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}