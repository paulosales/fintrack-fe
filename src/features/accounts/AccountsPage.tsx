import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import ConfirmDialog from '../../components/ConfirmDialog';
import FeedbackSnackbar from '../../components/FeedbackSnackbar';
import type { AppDispatch, RootState } from '../../store';
import AccountFormDialog from './AccountFormDialog';
import AccountTable from './AccountTable';
import useAccountActions, { buildAccountFormDefaults } from './useAccountActions';
import { fetchAccounts } from './accountsSlice';
import { fetchAccountTypes } from './accountTypesSlice';

const AccountsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.accounts);
  const {
    data: accountTypes,
    loading: accountTypesLoading,
    error: accountTypesError,
  } = useSelector((state: RootState) => state.accountTypes);

  const {
    dialogOpen,
    editingAccount,
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
  } = useAccountActions();

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchAccountTypes());
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
          {t('accounts.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
          {t('accounts.create')}
        </Button>
      </Box>

      {(error ?? accountTypesError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error
            ? t('accounts.failedLoadAccounts', { error })
            : t('accounts.failedLoadAccountTypes', { error: accountTypesError })}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('accounts.empty')}</Alert>
      )}

      {!loading && data.length > 0 && (
        <AccountTable
          accounts={data}
          accountTypes={accountTypes}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      <AccountFormDialog
        open={dialogOpen}
        editingAccount={editingAccount}
        initialValues={buildAccountFormDefaults(editingAccount)}
        accountTypes={accountTypes}
        accountTypesLoading={accountTypesLoading}
        formError={formError}
        isSubmitting={isSubmitting}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t('accounts.deleteConfirm', { id: confirmPayload?.id ?? '' })}
        content={t('accounts.deleteConfirm', { id: confirmPayload?.id ?? '' })}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
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

export default AccountsPage;
