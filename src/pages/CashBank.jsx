
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MoreVertical, Edit, Trash2, ArrowUpDown, Banknote, Landmark, Wallet, RefreshCw, AlertTriangle, Filter } from "lucide-react";
import { BankAccount } from "@/api/entities";
import { Transaction } from "@/api/entities"; // Changed import
import AddBankAccountDialog from '../components/cash-bank/AddBankAccountDialog';
import BankTransactionDialog from '../components/cash-bank/BankTransactionDialog';
import AdjustCashDialog from '../components/cash-bank/AdjustCashDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryApiCall = async (apiCall, maxRetries = 5, baseDelay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      if (error.message?.includes('429') || error.message?.includes('Rate limit')) {
        if (attempt === maxRetries) throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        const waitTime = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
};

const BankAccountsView = ({ accounts, onAccountSelect, selectedAccount, transactions, onAddAccount, onEditAccount, onDeleteAccount, onAddTransaction, onEditTransaction, onDeleteTransaction, onRefresh }) => {
  return (
    <div className="flex h-full w-full">
      <div className="w-1/3 border-r flex flex-col bg-white">
        <div className="p-4 border-b">
          <Button onClick={onAddAccount} className="w-full">
            <Plus className="w-4 h-4 mr-2" /> Add Bank
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {accounts.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No bank accounts added.</div>
          ) : (
            accounts.map(acc => (
              <div
                key={acc.id}
                className={`p-4 border-b cursor-pointer hover:bg-blue-50 group ${selectedAccount?.id === acc.id ? 'bg-blue-100 border-l-4 border-blue-600' : ''}`}
                onClick={() => onAccountSelect(acc)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Landmark className="w-5 h-5 text-blue-600" />
                    <div className="font-semibold text-slate-900">{acc.display_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-slate-900">₹{acc.current_balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-2/3 flex flex-col p-6 bg-slate-50">
        {selectedAccount ? (
          <>
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{selectedAccount.display_name}</CardTitle>
                  <p className="text-sm text-gray-500">{selectedAccount.bank_name}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onRefresh}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={onAddTransaction}>
                    <Plus className="w-4 h-4 mr-2" /> Deposit / Withdraw
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium text-gray-600">Account No:</span> {selectedAccount.account_number}</div>
                    <div><span className="font-medium text-gray-600">IFSC:</span> {selectedAccount.ifsc_code}</div>
                    <div><span className="font-medium text-gray-600">UPI ID:</span> {selectedAccount.upi_id}</div>
                </div>
              </CardContent>
            </Card>

            <h3 className="text-lg font-semibold mb-4">Transactions</h3>
            <div className="flex-1 overflow-y-auto rounded-lg border bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-500 py-4">No transactions found for this account.</TableCell>
                    </TableRow>
                  ) : (
                    transactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell className="capitalize font-medium">{tx.transaction_type?.replace(/_/g, ' ')}</TableCell>
                        <TableCell>{tx.party_name || tx.description}</TableCell>
                        <TableCell>{tx.date ? format(new Date(tx.date), 'dd MMM yyyy') : 'N/A'}</TableCell>
                        <TableCell className={`text-right font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount >= 0 ? '+' : '-'} ₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEditTransaction(tx)}>
                                <Edit className="w-4 h-4 mr-2" /> View/Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => onDeleteTransaction(tx)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a bank account to see details, or add a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CashInHandView = ({ cashAccount, onAddTransaction, onAdjustCash, transactions, onRefresh, onEditTransaction, onDeleteTransaction }) => {
  const getTransactionTypeIndicator = (type) => {
    switch (type) {
      case 'sale':
      case 'payment_in':
      case 'deposit':
        return 'bg-green-500';
      case 'expense':
      case 'purchase':
      case 'payment_out':
      case 'withdrawal':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-600" />
              Cash in Hand
            </CardTitle>
            <p className="text-sm text-gray-500">Your physical cash balance</p>
          </div>
          <div className="text-right">
            <div className="font-bold text-2xl text-green-600">
              ₹{cashAccount?.current_balance?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            {cashAccount ? `Account ID: ${cashAccount.id}` : 'No cash account configured. Please ensure one exists.'}
          </div>
        </CardContent>
      </Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Cash Transactions</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={onAdjustCash} variant="outline">
            <Filter className="w-4 h-4 mr-2" /> Adjust Cash
          </Button>
          <Button onClick={onAddTransaction}>
            <Plus className="w-4 h-4 mr-2" /> Add Transaction
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-4">No transactions found for cash in hand.</TableCell>
              </TableRow>
            ) : (
              transactions.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell>
                    <div className={`w-2 h-2 rounded-full ${getTransactionTypeIndicator(tx.transaction_type)}`}></div>
                  </TableCell>
                  <TableCell className="capitalize font-medium">{tx.transaction_type?.replace(/_/g, ' ')}</TableCell>
                  <TableCell>{tx.party_name || tx.description}</TableCell>
                  <TableCell>{tx.date ? format(new Date(tx.date), 'dd MMM yyyy') : 'N/A'}</TableCell>
                  <TableCell className={`text-right font-medium ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.amount >= 0 ? '+' : '-'} ₹{Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditTransaction(tx)}>
                          <Edit className="w-4 h-4 mr-2" /> View/Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => onDeleteTransaction(tx)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default function CashBank() {
  const location = useLocation();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [cashAccount, setCashAccount] = useState(null); // Represents the single "Cash in Hand" account
  const [showAddAccountDialog, setShowAddAccountDialog] = useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [showAdjustCashDialog, setShowAdjustCashDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('bank');

  const getTabFromUrl = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || 'bank';
  }, [location.search]);

  const loadTransactionsForAccount = useCallback(async (accountId) => {
    if (!accountId) {
      setTransactions([]);
      return;
    }
    try {
      const txs = await retryApiCall(() => Transaction.filter({ account_id: accountId }, '-date'));
      setTransactions(Array.isArray(txs) ? txs : []);
    } catch (err) {
      console.error(`Failed to load transactions for account ${accountId}:`, err);
      setError(err.message || 'Failed to load transactions.');
      setTransactions([]);
    }
  }, []);

  const loadData = useCallback(async (currentTab = activeTab) => {
    setIsLoading(true);
    setError(null);
    try {
      const allAccounts = await retryApiCall(() => BankAccount.list('-created_date'));
      const safeAccounts = Array.isArray(allAccounts) ? allAccounts : [];
      
      const bankAccountsData = safeAccounts.filter(acc => acc.account_type === 'bank');
      const cashAccountData = safeAccounts.find(acc => acc.account_type === 'cash'); // Assumes only one cash account
      
      setBankAccounts(bankAccountsData);
      setCashAccount(cashAccountData);

      if (currentTab === 'bank') {
        if (bankAccountsData.length > 0) {
          let accountToSelect = null;
          if (selectedAccount && bankAccountsData.some(b => b.id === selectedAccount.id)) {
            // Keep selected account if it still exists and is in the fetched list
            accountToSelect = bankAccountsData.find(b => b.id === selectedAccount.id);
          } else {
            // Otherwise, select the first bank account
            accountToSelect = bankAccountsData[0];
          }
          setSelectedAccount(accountToSelect);
          await loadTransactionsForAccount(accountToSelect?.id); // Use optional chaining
        } else {
          setSelectedAccount(null);
          setTransactions([]); // No bank accounts, clear transactions
        }
      } else if (currentTab === 'cash') {
        setSelectedAccount(null); // Ensure no bank account is selected when on cash tab
        if (cashAccountData) {
          await loadTransactionsForAccount(cashAccountData.id);
        } else {
          setTransactions([]); // No cash account found, clear transactions
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load data.');
      console.error("Error in loadData:", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, selectedAccount, loadTransactionsForAccount]);

  useEffect(() => {
    const tab = getTabFromUrl();
    setActiveTab(tab); // Update activeTab state based on URL
    loadData(tab); // Pass the determined tab to loadData
  }, [location.search, loadData, getTabFromUrl]);

  const handleAccountSelect = useCallback(async (account) => {
    if (!account || account.id === selectedAccount?.id) return;
    setSelectedAccount(account);
    await loadTransactionsForAccount(account.id);
  }, [selectedAccount, loadTransactionsForAccount]);

  const handleSaveAccount = async (accountData) => {
    setIsLoading(true);
    try {
      const apiCall = editingAccount
        ? () => BankAccount.update(editingAccount.id, accountData)
        : () => BankAccount.create(accountData);
      const savedAccount = await retryApiCall(apiCall);
      setShowAddAccountDialog(false);
      setEditingAccount(null);
      await delay(500); // Small delay to ensure DB update propagates
      await loadData(); // Reload all data
      // If adding a new bank account, and it's a bank type, select it
      if (!editingAccount && savedAccount && savedAccount.account_type === 'bank') {
        setSelectedAccount(savedAccount);
        await loadTransactionsForAccount(savedAccount.id);
      }
    } catch (err) {
      setError(err.message || 'Failed to save account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this account and all its transactions? This action cannot be undone.')) {
      return;
    }
    setIsLoading(true);
    try {
      await retryApiCall(() => BankAccount.delete(accountId));
      await delay(500); // Small delay
      await loadData();
      if (selectedAccount?.id === accountId) {
        setSelectedAccount(null); // Deselect if the deleted account was selected
      }
    } catch (err) {
      setError(err.message || 'Failed to delete account.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveTransaction = async (transactionData) => {
    setIsLoading(true);
    try {
      // Determine the account ID based on whether it's an existing transaction or a new one
      // If new, use the currently active tab's account (selected bank account or cash account)
      let affectedAccountId = transactionData.account_id || (activeTab === 'bank' ? selectedAccount?.id : cashAccount?.id);
      if (!affectedAccountId) {
        setError("No account selected or available for transaction.");
        setIsLoading(false);
        return;
      }
      
      let finalTransactionData = { ...transactionData, account_id: affectedAccountId };
      let originalAmount = 0;
      let isUpdate = false;

      if (editingTransaction) {
        originalAmount = editingTransaction.amount;
        isUpdate = true;
        // When updating, ensure the transaction's account_id is preserved if it came from editing
        // Or if the dialog allowed changing the account_id, use that.
        // For simplicity, we assume `transactionData.account_id` correctly reflects the target.
        await retryApiCall(() => Transaction.update(editingTransaction.id, finalTransactionData));
      } else {
        await retryApiCall(() => Transaction.create(finalTransactionData));
      }

      // Update account balance
      const account = await retryApiCall(() => BankAccount.get(affectedAccountId));
      if (account) {
        let newBalance = account.current_balance || 0;
        if (isUpdate) {
          // For updates, remove the original amount and add the new amount
          newBalance = newBalance - originalAmount + Number(finalTransactionData.amount);
        } else {
          // For new transactions, just add the amount
          newBalance = newBalance + Number(finalTransactionData.amount);
        }
        await retryApiCall(() => BankAccount.update(affectedAccountId, { current_balance: newBalance }));
      }
      
      setShowTransactionDialog(false);
      setEditingTransaction(null);
      await delay(500); // Small delay
      await loadData(); // Reload all data to refresh balances and transaction lists
    } catch (err) {
      setError(err.message || 'Failed to save transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (transactionToDelete) => {
    if (!window.confirm("Are you sure you want to delete this transaction? This action cannot be undone.")) {
      return;
    }
    setIsLoading(true);
    try {
      const account = await retryApiCall(() => BankAccount.get(transactionToDelete.account_id));
      if (account) {
        const newBalance = (account.current_balance || 0) - transactionToDelete.amount; // Reverse the transaction's effect
        await retryApiCall(() => BankAccount.update(account.id, { current_balance: newBalance }));
      }

      await retryApiCall(() => Transaction.delete(transactionToDelete.id));
      await delay(500); // Small delay
      await loadData();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      setError(err.message || "Could not delete the transaction.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdjustCash = async (adjustmentData) => {
    setIsLoading(true);
    try {
      if (!cashAccount) {
        setError("No cash account available to adjust. Please ensure a 'cash' account type exists.");
        setIsLoading(false);
        return;
      }
      
      // Ensure the transaction is linked to the primary cash account
      const finalAdjustmentData = { ...adjustmentData, account_id: cashAccount.id };
      
      await retryApiCall(() => Transaction.create(finalAdjustmentData));
      
      // Update balance for the cash account
      const account = await retryApiCall(() => BankAccount.get(cashAccount.id));
      if (account) {
        const newBalance = (account.current_balance || 0) + Number(finalAdjustmentData.amount);
        await retryApiCall(() => BankAccount.update(cashAccount.id, { current_balance: newBalance }));
      }
      setShowAdjustCashDialog(false);
      await delay(500);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to adjust cash.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleRefresh = () => {
    loadData();
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="h-full w-full">
      {activeTab === 'bank' ? (
        <BankAccountsView
          accounts={bankAccounts}
          selectedAccount={selectedAccount}
          transactions={transactions}
          onAccountSelect={handleAccountSelect}
          onAddAccount={() => { setEditingAccount(null); setShowAddAccountDialog(true); }}
          onEditAccount={(acc) => { setEditingAccount(acc); setShowAddAccountDialog(true); }}
          onDeleteAccount={handleDeleteAccount}
          onAddTransaction={() => { setEditingTransaction(null); setShowTransactionDialog(true); }}
          onEditTransaction={(tx) => { setEditingTransaction(tx); setShowTransactionDialog(true); }}
          onDeleteTransaction={handleDeleteTransaction}
          onRefresh={handleRefresh}
        />
      ) : (
        <CashInHandView
          cashAccount={cashAccount} // Pass the single cash account object
          transactions={transactions} // Pass the transactions state, which now holds cash transactions
          onAdjustCash={() => setShowAdjustCashDialog(true)}
          onAddTransaction={() => { setEditingTransaction(null); setShowTransactionDialog(true); }}
          onEditTransaction={(tx) => { setEditingTransaction(tx); setShowTransactionDialog(true); }}
          onDeleteTransaction={handleDeleteTransaction}
          onRefresh={handleRefresh}
        />
      )}

      <AddBankAccountDialog
        open={showAddAccountDialog}
        onClose={() => setShowAddAccountDialog(false)}
        onSubmit={handleSaveAccount}
        account={editingAccount}
      />
      <BankTransactionDialog
        open={showTransactionDialog}
        onClose={() => { setShowTransactionDialog(false); setEditingTransaction(null); }}
        onSubmit={handleSaveTransaction}
        transaction={editingTransaction}
        // Pass the account ID currently in scope for transaction (either selected bank or cash account)
        currentAccountId={editingTransaction?.account_id || (activeTab === 'bank' ? selectedAccount?.id : cashAccount?.id)}
        accounts={bankAccounts} // Still pass all bank accounts for selection if the dialog supports it
        cashAccounts={cashAccount ? [cashAccount] : []} // Pass the single cash account as an array if the dialog expects a list
      />
      <AdjustCashDialog
        open={showAdjustCashDialog}
        onClose={() => setShowAdjustCashDialog(false)}
        onSubmit={handleAdjustCash}
        cashAccount={cashAccount} // Pass the single cash account object to the dialog
      />
    </div>
  );
}
