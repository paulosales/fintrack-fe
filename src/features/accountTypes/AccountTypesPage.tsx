import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import ConfirmDialog from '../../components/ConfirmDialog';
import FeedbackSnackbar from '../../components/FeedbackSnackbar';
import type { AppDispatch, RootState } from '../../store';
import { fetchAccountTypes } from '../accounts/accountTypesSlice';
import AccountTypeFormDialog from './AccountTypeFormDialog';
import AccountTypeTable from './AccountTypeTable';
import useAccountTypeActions, { buildAccountTypeFormDefaults } from './useAccountTypeActions';

const AccountTypesPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.accountTypes);

  const {
    dialogOpen,
    editingAccountType,
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
  } = useAccountTypeActions();

  useEffect(() => {
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
          {t('accountTypes.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
          {t('accountTypes.create')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('accountTypes.failedLoadAccountTypes', { error })}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('accountTypes.empty')}</Alert>
      )}

      {!loading && data.length > 0 && (
        <AccountTypeTable
          accountTypes={data}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      <AccountTypeFormDialog
        open={dialogOpen}
        editingAccountType={editingAccountType}
        initialValues={buildAccountTypeFormDefaults(editingAccountType)}
        formError={formError}
        isSubmitting={isSubmitting}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t('accountTypes.deleteConfirm', { id: confirmPayload?.id ?? '' })}
        content={t('accountTypes.deleteConfirm', { id: confirmPayload?.id ?? '' })}
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

export default AccountTypesPage;
