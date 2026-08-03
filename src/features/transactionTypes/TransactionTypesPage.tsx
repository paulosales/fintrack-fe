import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import ConfirmDialog from '../../components/ConfirmDialog';
import FeedbackSnackbar from '../../components/FeedbackSnackbar';
import type { AppDispatch, RootState } from '../../store';
import TransactionTypeFormDialog from './TransactionTypeFormDialog';
import TransactionTypeTable from './TransactionTypeTable';
import { fetchTransactionTypes } from './transactionTypesSlice';
import useTransactionTypeActions, {
  buildTransactionTypeFormDefaults,
} from './useTransactionTypeActions';

const TransactionTypesPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.transactionTypes);

  const {
    dialogOpen,
    editingTransactionType,
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
  } = useTransactionTypeActions();

  useEffect(() => {
    dispatch(fetchTransactionTypes());
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
          {t('transactionTypes.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
          {t('transactionTypes.create')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('transactionTypes.failedLoadTransactionTypes', { error })}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('transactionTypes.empty')}</Alert>
      )}

      {!loading && data.length > 0 && (
        <TransactionTypeTable
          transactionTypes={data}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      <TransactionTypeFormDialog
        open={dialogOpen}
        editingTransactionType={editingTransactionType}
        initialValues={buildTransactionTypeFormDefaults(editingTransactionType)}
        formError={formError}
        isSubmitting={isSubmitting}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t('transactionTypes.deleteConfirm', { id: confirmPayload?.id ?? '' })}
        content={t('transactionTypes.deleteConfirm', { id: confirmPayload?.id ?? '' })}
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

export default TransactionTypesPage;