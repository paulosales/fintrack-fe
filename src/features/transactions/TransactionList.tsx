import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { Alert, Box, Button, Typography } from '@mui/material';
import ConfirmDialog from '../../components/ConfirmDialog';
import FeedbackSnackbar from '../../components/FeedbackSnackbar';
import ImportDialog from './ImportDialog';

import type { Transaction } from './types';
import SubTransactionFormDialog from './SubTransactionFormDialog';
import type { RootState, AppDispatch } from '../../store';
import TransactionFormDialog from './TransactionFormDialog';
import TransactionFilters from './TransactionFilters';
import TransactionTable from './TransactionTable';
import useTransactionFilters from './useTransactionFilters';
import useTransactionActions, { buildTransactionFormDefaults } from './useTransactionActions';
import useSubTransactionActions from './useSubTransactionActions';
import { fetchAccounts } from '../accounts/accountsSlice';
import { fetchCategories } from '../categories/categoriesSlice';
import { fetchTransactionTypes } from '../transactionTypes/transactionTypesSlice';
import { resetImport } from './importSlice';

const TransactionList: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFeedback, setImportFeedback] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const { data, loading, error, pagination } = useSelector(
    (state: RootState) => state.transactions
  );
  const accountsState = useSelector((state: RootState) => state.accounts);
  const categoriesState = useSelector((state: RootState) => state.categories);
  const transactionTypesState = useSelector((state: RootState) => state.transactionTypes);
  const subTransactionsByTransactionId =
    useSelector((state: RootState) => state.transactions.detailsByTransactionId) || {};

  const accounts = accountsState.data;
  const transactionTypes = transactionTypesState.data;
  const categories = categoriesState.data;

  const {
    filters,
    setPage,
    reloadTransactions,
    handleReload,
    handleAccountChange,
    handleTransactionTypeChange,
    handleCategoryChange,
    handleDescriptionChange,
    handlePageSizeChange,
  } = useTransactionFilters();

  const { page } = filters;

  const {
    dialogOpen,
    editingTransaction,
    formError,
    isSubmitting,
    actionError,
    closeFeedback,
    confirmOpen,
    confirmPayload,
    closeConfirm,
    handleCreateClick,
    handleEditClick,
    handleDialogClose,
    handleSubmit,
    handleDeleteClick,
    handleDeleteSub,
    handleConfirm,
  } = useTransactionActions({ dataLength: data.length, page, setPage, reloadTransactions });

  const {
    expandedIds,
    editingSub,
    subDialogOpen,
    toggleExpand,
    handleEditSub,
    handleOpenCreateSub,
    handleCloseSubDialog,
    handleSaveSub,
    handleCreateSub,
  } = useSubTransactionActions();

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactionTypes());
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetImport());
    };
  }, [dispatch]);

  const getAccountName = (id: number) => {
    const acc = accounts.find((a) => a.id === id);
    return acc ? `${acc.code} - ${acc.name}` : `${t('transactions.form.account')} ${id}`;
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h4" component="h1">
          {t('transactions.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FileUploadIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            {t('import.button')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
            {t('transactions.create')}
          </Button>
        </Box>
      </Box>

      <TransactionFilters
        filters={filters}
        options={{ accounts, transactionTypes, categories }}
        loadingState={{
          accounts: accountsState.loading,
          transactionTypes: transactionTypesState.loading,
          categories: categoriesState.loading,
          transactions: loading,
        }}
        actions={{
          onAccountChange: handleAccountChange,
          onTransactionTypeChange: handleTransactionTypeChange,
          onCategoryChange: handleCategoryChange,
          onDescriptionChange: handleDescriptionChange,
          onReload: handleReload,
        }}
      />

      {accountsState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('transactions.failedLoadAccounts', { error: accountsState.error })}
        </Alert>
      )}
      {transactionTypesState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('transactions.failedLoadTypes', { error: transactionTypesState.error })}
        </Alert>
      )}
      {categoriesState.error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('transactions.failedLoadCategories', { error: categoriesState.error })}
        </Alert>
      )}
      {error && <Alert severity="error">{t('transactions.error', { error })}</Alert>}
      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('transactions.empty')}</Alert>
      )}

      {data.length > 0 && (
        <TransactionTable
          transactions={data}
          expandedIds={expandedIds}
          subTransactionsByTransactionId={subTransactionsByTransactionId}
          pagination={pagination}
          getAccountName={getAccountName}
          onToggleExpand={(tx: Transaction) => toggleExpand(tx.id)}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onEditSub={handleEditSub}
          onDeleteSub={handleDeleteSub}
          onCreateSub={handleOpenCreateSub}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <TransactionFormDialog
        open={dialogOpen}
        editingTransaction={editingTransaction}
        initialValues={buildTransactionFormDefaults(editingTransaction, accounts, transactionTypes)}
        formError={formError}
        isSubmitting={isSubmitting}
        accounts={accounts}
        transactionTypes={transactionTypes}
        categories={categories}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
      />

      <SubTransactionFormDialog
        key={editingSub?.id ?? 'new'}
        open={subDialogOpen}
        editing={editingSub}
        categories={categories}
        onClose={handleCloseSubDialog}
        onSave={handleSaveSub}
        onCreate={handleCreateSub}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={confirmPayload?.title}
        content={confirmPayload?.content}
        confirmText={t('common.yes') || 'Delete'}
        cancelText={t('common.no') || 'Cancel'}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />

      <FeedbackSnackbar
        open={Boolean(actionError)}
        message={actionError || ''}
        severity="error"
        onClose={closeFeedback}
      />

      <ImportDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onSuccess={(queuedCount) => {
          setImportDialogOpen(false);
          handleReload();
          setImportFeedback({
            open: true,
            message: t('import.success', { count: queuedCount }),
            severity: 'success',
          });
        }}
        onError={(message) => {
          setImportFeedback({
            open: true,
            message: t('import.error', { error: message }),
            severity: 'error',
          });
        }}
      />

      <FeedbackSnackbar
        open={importFeedback.open}
        message={importFeedback.message}
        severity={importFeedback.severity}
        onClose={() => setImportFeedback((prev) => ({ ...prev, open: false }))}
      />
    </Box>
  );
};

export default TransactionList;
