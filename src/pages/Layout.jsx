

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  Banknote,
  BarChart3,
  HardDrive,
  Wrench,
  Settings,
  Building,
  ChevronRight,
  ChevronDown,
  Plus,
  CheckCircle,
  LogOut,
  User as UserIcon,
  Rocket,
  BookText,
  Landmark,
  Receipt,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppSettings } from '@/api/entities';
import PasscodeLockScreen from '@/components/auth/PasscodeLockScreen';
import { Company } from '@/api/entities';
import { User } from '@/api/entities';
import Header from './components/layout/Header';

const MASTER_NAVIGATION_ITEMS = [
  { title: "Home", url: createPageUrl("Dashboard"), icon: Home },
  { title: "Parties", url: createPageUrl("Parties"), icon: Users },
  { title: "Items", url: createPageUrl("Products"), icon: Package },
  {
    title: "Sale",
    icon: TrendingUp,
    subItems: [
      { title: "Sale Invoices", url: createPageUrl("Sales"), setting: 'always_show' },
      { title: "Payment In", url: createPageUrl("Payments?type=payment_in"), setting: 'always_show' },
      { title: "Sale Orders", url: createPageUrl("Sales?view=orders"), setting: 'enable_sale_purchase_order' },
      { title: "Sale Returns", url: createPageUrl("Sales?view=returns"), setting: 'always_show' },
      { title: "Estimates", url: createPageUrl("Sales?view=estimates"), setting: 'enable_estimate_quotation' },
      { title: "Proforma Invoices", url: createPageUrl("Sales?view=proforma"), setting: 'enable_proforma_invoice' },
      { title: "Delivery Challans", url: createPageUrl("Sales?view=challans"), setting: 'enable_delivery_challan' },
    ]
  },
  {
    title: "Purchase",
    icon: ShoppingCart,
    subItems: [
      { title: "Purchase Bills", url: createPageUrl("Purchase"), setting: 'always_show' },
      { title: "Payment Out", url: createPageUrl("Payments?type=payment_out"), setting: 'always_show' },
      { title: "Purchase Orders", url: createPageUrl("Purchase?view=orders"), setting: 'enable_sale_purchase_order' },
      { title: "Purchase Returns", url: createPageUrl("Purchase?view=returns"), setting: 'always_show' },
    ]
  },
  { title: "Expense", url: createPageUrl("Expense"), icon: Receipt },
  {
    title: "Cash & Bank",
    icon: Banknote,
    subItems: [
      { title: "Bank Accounts", url: createPageUrl("CashBank?tab=bank"), setting: 'always_show' },
      { title: "Cash In Hand", url: createPageUrl("CashBank?tab=cash"), setting: 'always_show' },
      { title: "Cheques", url: createPageUrl("Cheques"), setting: 'always_show' },
      { title: "Loan Accounts", url: createPageUrl("LoanAccounts"), setting: 'always_show' },
    ]
  },
  { title: "Accounting", url: createPageUrl("Utilities"), icon: BookText },
  { title: "Reports", url: createPageUrl("Reports"), icon: BarChart3 },
  { title: "Sync, Share & Backup", url: createPageUrl("Backup"), icon: HardDrive },
  { title: "Utilities", url: createPageUrl("Utilities"), icon: Wrench },
  { title: "Settings", url: createPageUrl("Settings"), icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});
  const [appSettings, setAppSettings] = useState(null);
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [navigationItems, setNavigationItems] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);

  const fetchSettings = async () => {
    let settings = {};
    try {
      const settingsList = await AppSettings.list();
      settings = settingsList?.[0] || {};
      setAppSettings(settings);

      const zoomLevel = settings.screen_zoom_scale || 90;
      document.documentElement.style.zoom = `${zoomLevel}%`;

      if (!settings?.enable_passcode || !settings?.passcode) {
        setIsLocked(false);
      }
    } catch (error) {
      console.error("Error fetching app settings:", error);
      setIsLocked(false);
      document.documentElement.style.zoom = `90%`;
    } finally {
      const filteredNav = MASTER_NAVIGATION_ITEMS.map(item => {
        if (!item.subItems) return item;
        const filteredSubItems = item.subItems.filter(subItem => {
          return subItem.setting === 'always_show' || !subItem.setting || settings[subItem.setting];
        });
        if (item.subItems && filteredSubItems.length === 0) return null;
        return { ...item, subItems: filteredSubItems };
      }).filter(Boolean);
      setNavigationItems(filteredNav);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuthAndCompany = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
        setIsAuthenticated(true);

        const userCompanies = await Company.filter({ created_by: currentUser.email });
        setCompanies(userCompanies);
        
        const companyExists = userCompanies && userCompanies.length > 0;
        setHasCompany(companyExists);

        if (companyExists) {
          const activeComp = userCompanies.find(c => c.id === currentUser.active_company_id) || userCompanies[0];
          setActiveCompany(activeComp);
          if (!currentUser.active_company_id || currentUser.active_company_id !== activeComp.id) {
            await User.updateMyUserData({ active_company_id: activeComp.id });
          }
          await fetchSettings();
        } else {
          if (currentPageName !== 'BusinessProfileSetup') {
            navigate(createPageUrl('BusinessProfileSetup'));
          }
          setIsLoading(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setHasCompany(false);
        setIsLoading(false);
        document.documentElement.style.zoom = `90%`;
      }
    };

    checkAuthAndCompany();
  }, [location.pathname, currentPageName, navigate]);

  useEffect(() => {
    const newOpenState = {};
    navigationItems.forEach(item => {
      if (item.subItems) {
        const isParentOfActiveItem = item.subItems.some(subItem => {
          const currentPath = location.pathname + location.search;
          if (currentPath === subItem.url) return true;

          // Special check to keep Cash & Bank menu open when on that page
          if (item.title === "Cash & Bank" && location.pathname.startsWith(createPageUrl("CashBank"))) {
            return true;
          }
          if (item.title === "Cash & Bank" && location.pathname.startsWith(createPageUrl("Cheques"))) {
            return true;
          }
          if (item.title === "Cash & Bank" && location.pathname.startsWith(createPageUrl("LoanAccounts"))) {
            return true;
          }

          // These specific checks were in the original useEffect.
          // The outline's useEffect block for this section is identical to current.
          // Therefore, these specific checks for opening the parent menu are preserved.
          if (subItem.url === createPageUrl("Sales") && location.pathname === createPageUrl("Sales") && !location.search) return true;
          if (subItem.url === createPageUrl("Purchase") && location.pathname === createPageUrl("Purchase") && !location.search) return true;
          return false;
        });

        if (isParentOfActiveItem) {
          newOpenState[item.title] = true;
        }
      }
    });
    setOpenMenus(newOpenState);
  }, [location.pathname, location.search, navigationItems]);

  const toggleMenu = (title) => {
    setOpenMenus(prev => ({...prev, [title]: !prev[title]}));
  };

  const handleCompanySwitch = async (companyId) => {
    if (companyId === activeCompany?.id) return;
    try {
      await User.updateMyUserData({ active_company_id: companyId });
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch company:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await User.logout();
      navigate(createPageUrl('Home'));
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const fullPageForms = [
    'Home',
    'BusinessProfileSetup',
    'OnboardingCompletion',
    'POS',
    'Settings',
    'CreateSalesInvoice',
    'CreatePurchaseInvoice',
    'CreateProformaInvoice',
    'CreateSaleOrder',
    'CreateCreditNote',
    'CreatePayment',
    'CreateExpense',
    'CreatePurchaseOrder',
    'CreatePurchaseReturn',
    'CompanyProfile'
  ];

  if (!isAuthenticated && fullPageForms.includes(currentPageName)) {
    return <>{children}</>;
  }

  if (isAuthenticated && !hasCompany && currentPageName !== 'BusinessProfileSetup') {
      navigate(createPageUrl('BusinessProfileSetup'));
      return <div className="flex items-center justify-center h-screen">Redirecting to business profile setup...</div>;
  }

  if (isAuthenticated && hasCompany && isLocked && appSettings?.enable_passcode && appSettings?.passcode) {
      return <PasscodeLockScreen correctPasscode={appSettings.passcode} onUnlock={() => setIsLocked(false)} />;
  }

  const isFullPageForm = fullPageForms.some(page =>
    location.pathname.startsWith(createPageUrl(page).split('?')[0])
  );

  if (isFullPageForm) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <style>
          {`
            :root {
              --sidebar-background: 220 26% 14%;
              --sidebar-foreground: 220 9% 46%;
              --sidebar-primary: 220 13% 91%;
              --sidebar-primary-foreground: 220 26% 14%;
              --sidebar-accent: 220 13% 91%;
              --sidebar-accent-foreground: 220 26% 14%;
              --sidebar-border: 220 13% 91%;
            }
            .dark-sidebar {
              background: hsl(var(--sidebar-background));
              color: hsl(var(--sidebar-foreground));
            }
            .sidebar-item {
              transition: all 0.2s ease;
            }
            .sidebar-item:hover {
              background: rgba(255, 255, 255, 0.1);
            }
            .sidebar-item.active {
              background: rgba(59, 130, 246, 0.1);
              color: #3b82f6;
            }
            html {
              font-size: 14px;
            }
          `}
        </style>

        <Sidebar className="dark-sidebar border-r border-gray-700 w-64">
          <SidebarHeader className="border-b border-gray-700 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="w-full text-left cursor-pointer">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {activeCompany?.logo_url ? (
                        <img src={activeCompany.logo_url} alt="Company Logo" className="w-full h-full rounded-lg object-cover" />
                    ) : (
                        <span className="text-white font-bold text-sm">{activeCompany?.name?.[0]?.toUpperCase() || 'C'}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm truncate">{activeCompany?.name || 'BizFlow'}</p>
                    <p className="text-xs text-gray-400 truncate">Switch Company</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                {companies.map(company => (
                  <DropdownMenuItem key={company.id} onClick={() => handleCompanySwitch(company.id)}>
                    <span className="truncate">{company.name}</span>
                    {company.id === activeCompany?.id && <CheckCircle className="w-4 h-4 ml-auto text-blue-600 flex-shrink-0" />}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(createPageUrl('BusinessProfileSetup'))}>
                  <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                  Add New Company
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarHeader>

          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2 mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    item.subItems ? (
                      <React.Fragment key={item.title}>
                        <SidebarMenuItem>
                          <SidebarMenuButton
                            onClick={() => toggleMenu(item.title)}
                            className="sidebar-item w-full justify-between text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium"
                          >
                            <div className="flex items-center gap-3">
                              <item.icon className="w-4 h-4 flex-shrink-0" />
                              <span>{item.title}</span>
                            </div>
                            {openMenus[item.title] ? 
                              <ChevronDown className="w-4 h-4 flex-shrink-0" /> : 
                              <ChevronRight className="w-4 h-4 flex-shrink-0" />
                            }
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                        {openMenus[item.title] && (
                          <div className="ml-6 space-y-1">
                            {item.subItems.map(subItem => (
                              <SidebarMenuItem key={subItem.title}>
                                <SidebarMenuButton
                                  asChild
                                  className={`sidebar-item w-full justify-start text-sm ${
                                    (location.pathname + location.search === subItem.url)
                                      ? 'active'
                                      : 'text-gray-400 hover:text-white'
                                  }`}
                                >
                                  <Link to={subItem.url} className="flex items-center gap-2 px-3 py-2 rounded-lg w-full">
                                    <span className="truncate">{subItem.title}</span>
                                  </Link>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            ))}
                          </div>
                        )}
                      </React.Fragment>
                    ) : (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`sidebar-item ${
                            location.pathname === item.url
                              ? 'active'
                              : 'text-gray-300 hover:text-white'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-sm font-medium">
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-700 p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="w-full text-left cursor-pointer">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs">{user?.full_name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white text-sm truncate">{user?.full_name || 'User'}</p>
                    <p className="text-xs text-gray-400 truncate">Manage account</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 mb-2">
                <DropdownMenuItem onClick={() => navigate(createPageUrl('UserProfile'))}>
                    <UserIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">My Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate(createPageUrl('CompanyProfile'))}>
                    <Building className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Company Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-gray-50">
          <Header user={user} onLogout={handleLogout} />
          <div className="flex-1 w-full">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

