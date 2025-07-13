import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Parties from "./Parties";

import Sales from "./Sales";

import CreateSalesInvoice from "./CreateSalesInvoice";

import Products from "./Products";

import Purchase from "./Purchase";

import Expense from "./Expense";

import POS from "./POS";

import Settings from "./Settings";

import Utilities from "./Utilities";

import Reports from "./Reports";

import CashBank from "./CashBank";

import Backup from "./Backup";

import CompanyProfile from "./CompanyProfile";

import CreatePurchaseInvoice from "./CreatePurchaseInvoice";

import ProformaInvoice from "./ProformaInvoice";

import CreateProformaInvoice from "./CreateProformaInvoice";

import Payments from "./Payments";

import SaleOrders from "./SaleOrders";

import CreateSaleOrder from "./CreateSaleOrder";

import SalesReturn from "./SalesReturn";

import CreateExpense from "./CreateExpense";

import CreatePurchaseOrder from "./CreatePurchaseOrder";

import CreatePurchaseReturn from "./CreatePurchaseReturn";

import CreatePayment from "./CreatePayment";

import Estimate from "./Estimate";

import DeliveryChallan from "./DeliveryChallan";

import OtherIncome from "./OtherIncome";

import FixedAssets from "./FixedAssets";

import BusinessProfileSetup from "./BusinessProfileSetup";

import Home from "./Home";

import OnboardingCompletion from "./OnboardingCompletion";

import UserProfile from "./UserProfile";

import CreateEstimate from "./CreateEstimate";

import CreateDeliveryChallan from "./CreateDeliveryChallan";

import Cheques from "./Cheques";

import LoanAccounts from "./LoanAccounts";

import CreateSaleReturn from "./CreateSaleReturn";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Parties: Parties,
    
    Sales: Sales,
    
    CreateSalesInvoice: CreateSalesInvoice,
    
    Products: Products,
    
    Purchase: Purchase,
    
    Expense: Expense,
    
    POS: POS,
    
    Settings: Settings,
    
    Utilities: Utilities,
    
    Reports: Reports,
    
    CashBank: CashBank,
    
    Backup: Backup,
    
    CompanyProfile: CompanyProfile,
    
    CreatePurchaseInvoice: CreatePurchaseInvoice,
    
    ProformaInvoice: ProformaInvoice,
    
    CreateProformaInvoice: CreateProformaInvoice,
    
    Payments: Payments,
    
    SaleOrders: SaleOrders,
    
    CreateSaleOrder: CreateSaleOrder,
    
    SalesReturn: SalesReturn,
    
    CreateExpense: CreateExpense,
    
    CreatePurchaseOrder: CreatePurchaseOrder,
    
    CreatePurchaseReturn: CreatePurchaseReturn,
    
    CreatePayment: CreatePayment,
    
    Estimate: Estimate,
    
    DeliveryChallan: DeliveryChallan,
    
    OtherIncome: OtherIncome,
    
    FixedAssets: FixedAssets,
    
    BusinessProfileSetup: BusinessProfileSetup,
    
    Home: Home,
    
    OnboardingCompletion: OnboardingCompletion,
    
    UserProfile: UserProfile,
    
    CreateEstimate: CreateEstimate,
    
    CreateDeliveryChallan: CreateDeliveryChallan,
    
    Cheques: Cheques,
    
    LoanAccounts: LoanAccounts,
    
    CreateSaleReturn: CreateSaleReturn,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Parties" element={<Parties />} />
                
                <Route path="/Sales" element={<Sales />} />
                
                <Route path="/CreateSalesInvoice" element={<CreateSalesInvoice />} />
                
                <Route path="/Products" element={<Products />} />
                
                <Route path="/Purchase" element={<Purchase />} />
                
                <Route path="/Expense" element={<Expense />} />
                
                <Route path="/POS" element={<POS />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Utilities" element={<Utilities />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/CashBank" element={<CashBank />} />
                
                <Route path="/Backup" element={<Backup />} />
                
                <Route path="/CompanyProfile" element={<CompanyProfile />} />
                
                <Route path="/CreatePurchaseInvoice" element={<CreatePurchaseInvoice />} />
                
                <Route path="/ProformaInvoice" element={<ProformaInvoice />} />
                
                <Route path="/CreateProformaInvoice" element={<CreateProformaInvoice />} />
                
                <Route path="/Payments" element={<Payments />} />
                
                <Route path="/SaleOrders" element={<SaleOrders />} />
                
                <Route path="/CreateSaleOrder" element={<CreateSaleOrder />} />
                
                <Route path="/SalesReturn" element={<SalesReturn />} />
                
                <Route path="/CreateExpense" element={<CreateExpense />} />
                
                <Route path="/CreatePurchaseOrder" element={<CreatePurchaseOrder />} />
                
                <Route path="/CreatePurchaseReturn" element={<CreatePurchaseReturn />} />
                
                <Route path="/CreatePayment" element={<CreatePayment />} />
                
                <Route path="/Estimate" element={<Estimate />} />
                
                <Route path="/DeliveryChallan" element={<DeliveryChallan />} />
                
                <Route path="/OtherIncome" element={<OtherIncome />} />
                
                <Route path="/FixedAssets" element={<FixedAssets />} />
                
                <Route path="/BusinessProfileSetup" element={<BusinessProfileSetup />} />
                
                <Route path="/Home" element={<Home />} />
                
                <Route path="/OnboardingCompletion" element={<OnboardingCompletion />} />
                
                <Route path="/UserProfile" element={<UserProfile />} />
                
                <Route path="/CreateEstimate" element={<CreateEstimate />} />
                
                <Route path="/CreateDeliveryChallan" element={<CreateDeliveryChallan />} />
                
                <Route path="/Cheques" element={<Cheques />} />
                
                <Route path="/LoanAccounts" element={<LoanAccounts />} />
                
                <Route path="/CreateSaleReturn" element={<CreateSaleReturn />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}