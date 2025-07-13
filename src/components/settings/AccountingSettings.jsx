import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, DollarSign, FileText, TrendingUp } from 'lucide-react';

const CheckboxSetting = ({ id, label, info, checked, onCheckedChange, children }) => (
    <div className="flex items-start space-x-3">
        <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} className="mt-0.5" />
        <div className="flex-1 space-y-2">
            <Label htmlFor={id} className="font-normal flex items-center gap-2">
                {label}
                {info && <span className="text-xs text-gray-500">{info}</span>}
            </Label>
            {children}
        </div>
    </div>
);

export default function AccountingSettings({ settings, onSettingChange }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            General Accounting Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <CheckboxSetting
                id="enable_double_entry"
                label="Enable Double Entry Bookkeeping"
                info="Use double-entry accounting for all transactions."
                checked={settings.enable_double_entry || false}
                onCheckedChange={(c) => onSettingChange('enable_double_entry', c)}
              />

              <CheckboxSetting
                id="enable_chart_of_accounts"
                label="Enable Chart of Accounts"
                info="Use a structured chart of accounts for categorizing transactions."
                checked={settings.enable_chart_of_accounts || false}
                onCheckedChange={(c) => onSettingChange('enable_chart_of_accounts', c)}
              />

              <CheckboxSetting
                id="enable_journal_entries"
                label="Enable Manual Journal Entries"
                info="Allow creating manual journal entries for adjustments."
                checked={settings.enable_journal_entries || false}
                onCheckedChange={(c) => onSettingChange('enable_journal_entries', c)}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="accounting_method">Accounting Method</Label>
                <Select 
                  value={settings.accounting_method || 'cash'} 
                  onValueChange={(value) => onSettingChange('accounting_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash Basis</SelectItem>
                    <SelectItem value="accrual">Accrual Basis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="default_currency">Default Currency</Label>
                <Select 
                  value={settings.default_currency || 'INR'} 
                  onValueChange={(value) => onSettingChange('default_currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (₹)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <CheckboxSetting
                id="enable_multi_currency"
                label="Enable Multi-Currency"
                info="Support transactions in multiple currencies."
                checked={settings.enable_multi_currency || false}
                onCheckedChange={(c) => onSettingChange('enable_multi_currency', c)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Financial Year Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="financial_year_start">Financial Year Start</Label>
              <Select 
                value={settings.financial_year_start || 'april'} 
                onValueChange={(value) => onSettingChange('financial_year_start', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="january">January</SelectItem>
                  <SelectItem value="april">April</SelectItem>
                  <SelectItem value="july">July</SelectItem>
                  <SelectItem value="october">October</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="depreciation_method">Depreciation Method</Label>
              <Select 
                value={settings.depreciation_method || 'straight_line'} 
                onValueChange={(value) => onSettingChange('depreciation_method', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="straight_line">Straight Line</SelectItem>
                  <SelectItem value="declining_balance">Declining Balance</SelectItem>
                  <SelectItem value="sum_of_years">Sum of Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <CheckboxSetting
            id="auto_close_financial_year"
            label="Auto Close Financial Year"
            info="Automatically close books at the end of financial year."
            checked={settings.auto_close_financial_year || false}
            onCheckedChange={(c) => onSettingChange('auto_close_financial_year', c)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue Recognition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <CheckboxSetting
                id="enable_revenue_recognition"
                label="Enable Revenue Recognition"
                info="Track revenue recognition for services and subscriptions."
                checked={settings.enable_revenue_recognition || false}
                onCheckedChange={(c) => onSettingChange('enable_revenue_recognition', c)}
              />

              <CheckboxSetting
                id="enable_deferred_revenue"
                label="Enable Deferred Revenue"
                info="Track deferred revenue for advance payments."
                checked={settings.enable_deferred_revenue || false}
                onCheckedChange={(c) => onSettingChange('enable_deferred_revenue', c)}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="revenue_recognition_method">Recognition Method</Label>
                <Select 
                  value={settings.revenue_recognition_method || 'delivery'} 
                  onValueChange={(value) => onSettingChange('revenue_recognition_method', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delivery">On Delivery</SelectItem>
                    <SelectItem value="payment">On Payment</SelectItem>
                    <SelectItem value="percentage">Percentage of Completion</SelectItem>
                    <SelectItem value="milestone">Milestone Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <CheckboxSetting
                id="auto_generate_accruals"
                label="Auto Generate Accruals"
                info="Automatically generate accrual entries at period end."
                checked={settings.auto_generate_accruals || false}
                onCheckedChange={(c) => onSettingChange('auto_generate_accruals', c)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reports & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <CheckboxSetting
                id="enable_automated_reports"
                label="Enable Automated Reports"
                info="Generate financial reports automatically."
                checked={settings.enable_automated_reports || false}
                onCheckedChange={(c) => onSettingChange('enable_automated_reports', c)}
              />

              <CheckboxSetting
                id="enable_budget_tracking"
                label="Enable Budget Tracking"
                info="Track actual vs budget performance."
                checked={settings.enable_budget_tracking || false}
                onCheckedChange={(c) => onSettingChange('enable_budget_tracking', c)}
              />

              <CheckboxSetting
                id="enable_cost_center_tracking"
                label="Enable Cost Center Tracking"
                info="Track expenses by cost centers or departments."
                checked={settings.enable_cost_center_tracking || false}
                onCheckedChange={(c) => onSettingChange('enable_cost_center_tracking', c)}
              />
            </div>

            <div className="space-y-4">
              <CheckboxSetting
                id="enable_audit_trail"
                label="Enable Audit Trail"
                info="Maintain detailed audit trail for all transactions."
                checked={settings.enable_audit_trail || false}
                onCheckedChange={(c) => onSettingChange('enable_audit_trail', c)}
              />

              <CheckboxSetting
                id="enable_tax_compliance"
                label="Enable Tax Compliance"
                info="Automatically handle tax calculations and reporting."
                checked={settings.enable_tax_compliance || false}
                onCheckedChange={(c) => onSettingChange('enable_tax_compliance', c)}
              />

              <CheckboxSetting
                id="enable_period_locking"
                label="Enable Period Locking"
                info="Lock accounting periods to prevent changes."
                checked={settings.enable_period_locking || false}
                onCheckedChange={(c) => onSettingChange('enable_period_locking', c)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Advanced Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <CheckboxSetting
                id="enable_cash_flow_forecasting"
                label="Enable Cash Flow Forecasting"
                info="Predict future cash flows based on historical data."
                checked={settings.enable_cash_flow_forecasting || false}
                onCheckedChange={(c) => onSettingChange('enable_cash_flow_forecasting', c)}
              />

              <CheckboxSetting
                id="enable_financial_dashboard"
                label="Enable Financial Dashboard"
                info="Show key financial metrics on dashboard."
                checked={settings.enable_financial_dashboard || false}
                onCheckedChange={(c) => onSettingChange('enable_financial_dashboard', c)}
              />

              <CheckboxSetting
                id="enable_bank_reconciliation"
                label="Enable Bank Reconciliation"
                info="Automatically reconcile bank statements."
                checked={settings.enable_bank_reconciliation || false}
                onCheckedChange={(c) => onSettingChange('enable_bank_reconciliation', c)}
              />
            </div>

            <div className="space-y-4">
              <CheckboxSetting
                id="enable_project_accounting"
                label="Enable Project Accounting"
                info="Track costs and revenues by projects."
                checked={settings.enable_project_accounting || false}
                onCheckedChange={(c) => onSettingChange('enable_project_accounting', c)}
              />

              <CheckboxSetting
                id="enable_inter_company_transactions"
                label="Enable Inter-Company Transactions"
                info="Handle transactions between multiple companies."
                checked={settings.enable_inter_company_transactions || false}
                onCheckedChange={(c) => onSettingChange('enable_inter_company_transactions', c)}
              />

              <CheckboxSetting
                id="enable_analytical_accounting"
                label="Enable Analytical Accounting"
                info="Add analytical dimensions to transactions."
                checked={settings.enable_analytical_accounting || false}
                onCheckedChange={(c) => onSettingChange('enable_analytical_accounting', c)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}