
import React, { useState, useEffect } from 'react';
import { Search, X, Save, HelpCircle, Users, Package, Bell, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/utils';
import { AppSettings } from '@/api/entities';
import { Company } from '@/api/entities'; // Changed from Firm to Company
import { TransactionPrefix } from '@/api/entities';
import { User } from '@/api/entities'; // Added User entity

import GeneralSettings from '../components/settings/GeneralSettings';
import TransactionSettings from '../components/settings/TransactionSettings';
import PrintSettings from '../components/settings/PrintSettings';
import TaxesGSTSettings from '../components/settings/TaxesGSTSettings';
import TransactionMessageSettings from '../components/settings/TransactionMessageSettings';
import BillingSystemGuide from '../components/settings/BillingSystemGuide';
import PartySettings from '../components/settings/PartySettings';
import ItemSettings from '../components/settings/ItemSettings';
import ServiceRemindersSettings from '../components/settings/ServiceRemindersSettings';
import AccountingSettings from '../components/settings/AccountingSettings';


export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({});
  const [activeCompany, setActiveCompany] = useState(null); // Changed from firms to activeCompany
  const [prefixes, setPrefixes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      const user = await User.me(); // Fetch current user
      const [settingsData, companiesData, prefixesData] = await Promise.all([
        AppSettings.list(),
        Company.list(), // Changed from Firm.list() to Company.list()
        TransactionPrefix.list()
      ]);
      
      setSettings(settingsData?.[0] || {});
      // Determine the active company based on user's active_company_id, fallback to first company
      const currentActiveCompany = companiesData?.find(c => c.id === user.active_company_id) || companiesData?.[0];
      setActiveCompany(currentActiveCompany); // Set active company
      setPrefixes(prefixesData || []);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      if (settings.id) {
        await AppSettings.update(settings.id, settings);
      } else {
        await AppSettings.create(settings);
      }
      setHasUnsavedChanges(false);
      // Show success message
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const tabs = [
    { id: 'guide', label: 'How It Works', icon: HelpCircle },
    { id: 'general', label: 'General' },
    { id: 'transaction', label: 'Transaction' },
    { id: 'print', label: 'Print' },
    { id: 'taxes', label: 'Taxes & GST' },
    { id: 'messages', label: 'Transaction Message' },
    { id: 'party', label: 'Party', icon: Users },
    { id: 'item', label: 'Item', icon: Package },
    { id: 'reminders', label: 'Service Reminders', icon: Bell },
    { id: 'accounting', label: 'Accounting', icon: BookOpen }
  ];

  const renderTabContent = () => {
    const commonProps = {
      settings,
      onSettingChange: handleSettingChange,
      activeCompany, // Changed from firms to activeCompany
      prefixes,
      onPrefixesChange: setPrefixes
    };

    switch (activeTab) {
      case 'guide':
        return <BillingSystemGuide />;
      case 'general':
        return <GeneralSettings {...commonProps} />;
      case 'transaction':
        return <TransactionSettings {...commonProps} />;
      case 'print':
        return <PrintSettings {...commonProps} />;
      case 'taxes':
        return <TaxesGSTSettings {...commonProps} />;
      case 'messages':
        return <TransactionMessageSettings {...commonProps} />;
      case 'party':
        return <PartySettings {...commonProps} />;
      case 'item':
        return <ItemSettings {...commonProps} />;
      case 'reminders':
        return <ServiceRemindersSettings {...commonProps} />;
      case 'accounting':
        return <AccountingSettings {...commonProps} />;
      default:
        return <GeneralSettings {...commonProps} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/Dashboard')}
              className="rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500">Configure your BizFlow application</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="text-sm text-orange-600 font-medium">
                Unsaved changes
              </span>
            )}
            <Button
              onClick={handleSaveSettings}
              disabled={!hasUnsavedChanges}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {Icon && <Icon className="w-4 h-4" />}
                      {tab.label}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-7xl">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
