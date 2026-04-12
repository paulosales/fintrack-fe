import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, Typography } from '@mui/material';
import ConfirmDialog from '../../components/ConfirmDialog';
import FeedbackSnackbar from '../../components/FeedbackSnackbar';
import { fetchAccounts } from '../accounts/accountsSlice';
import type { AppDispatch, RootState } from '../../store';
import BudgetSetupFormDialog from './BudgetSetupFormDialog';
import BudgetSetupTable from './BudgetSetupTable';
import useBudgetSetupActions, { buildBudgetSetupFormDefaults } from './useBudgetSetupActions';
import useBudgetSetupFilters from './useBudgetSetupFilters';

const BudgetSetupListPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error, pagination } = useSelector(
    (state: RootState) => state.budgetSetups
  );
  const {
    data: accounts,
    loading: accountsLoading,
    error: accountsError,
  } = useSelector((state: RootState) => state.accounts);

  const { page, setPage, reloadBudgetSetups, handlePageSizeChange } = useBudgetSetupFilters();

  const {
    dialogOpen,
    editingBudgetSetup,
    formError,
    isSubmitting,
    actionError,
    actionMessage,
    closeFeedback,
    confirmOpen,
    confirmPayload,
    closeConfirm,
    handleCreateClick,
    handleEditClick,
    handleDialogClose,
    handleSubmit,
    handleDeleteClick,
    handleConfirm,
  } = useBudgetSetupActions({ dataLength: data.length, page, setPage, reloadBudgetSetups });

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h4" component="h1">
          {t('budgetSetups.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
          {t('budgetSetups.create')}
        </Button>
      </Box>

      {accountsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('budgetSetups.failedLoadAccounts', { error: accountsError })}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('budgetSetups.failedLoadBudgetSetups', { error })}
        </Alert>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('budgetSetups.empty')}</Alert>
      )}

      {data.length > 0 && (
        <BudgetSetupTable
          budgetSetups={data}
          pagination={pagination}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={confirmPayload?.title}
        content={confirmPayload?.content}
        confirmText={t('common.yes') || 'Delete'}
        cancelText={t('common.no') || 'Cancel'}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
      />

      <BudgetSetupFormDialog
        open={dialogOpen}
        editingBudgetSetup={editingBudgetSetup}
        initialValues={buildBudgetSetupFormDefaults(editingBudgetSetup, accounts)}
        formError={formError}
        isSubmitting={isSubmitting || accountsLoading}
        accounts={accounts}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
      />

      <FeedbackSnackbar
        open={Boolean(actionError || actionMessage)}
        message={actionError || actionMessage || ''}
        severity={actionError ? 'error' : 'success'}
        onClose={closeFeedback}
      />
    </Box>
  );
};

export default BudgetSetupListPage;
