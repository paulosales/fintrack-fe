import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { fetchAccounts } from '../accounts/accountsSlice';
import PaginationControls from '../../components/PaginationControls';
import { formatCurrency } from '../../utils/currencyUtils';
import type { AppDispatch, RootState } from '../../store';
import {
  createBudgetSetup,
  deleteBudgetSetup,
  fetchBudgetSetups,
  updateBudgetSetup,
} from './budgetSetupSlice';
import BudgetSetupFormDialog from './BudgetSetupFormDialog';
import type { BudgetSetupFormState, BudgetSetupMutationPayload, BudgetSetupRecord } from './types';

const getCurrentLocalDate = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 10);
};

const buildBudgetSetupFormDefaults = (
  budgetSetup: BudgetSetupRecord | null,
  accountOptions: RootState['accounts']['data']
): BudgetSetupFormState => ({
  accountId: budgetSetup
    ? String(budgetSetup.accountId)
    : accountOptions[0]
      ? String(accountOptions[0].id)
      : '',
  date: budgetSetup?.date ?? getCurrentLocalDate(),
  isRepeatle: budgetSetup?.isRepeatle ?? false,
  repeatFrequency: budgetSetup?.repeatFrequency ?? '',
  endDate: budgetSetup?.endDate ?? '',
  description: budgetSetup?.description ?? '',
  amount: budgetSetup ? String(budgetSetup.amount) : '',
  note: budgetSetup?.note ?? '',
});

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBudgetSetup, setEditingBudgetSetup] = useState<BudgetSetupRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchBudgetSetups({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  const reloadBudgetSetups = (nextPage = page) => {
    dispatch(fetchBudgetSetups({ page: nextPage, pageSize }));
  };

  const handleCreateClick = () => {
    setEditingBudgetSetup(null);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleEditClick = (budgetSetup: BudgetSetupRecord) => {
    setEditingBudgetSetup(budgetSetup);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (isSubmitting) {
      return;
    }

    setDialogOpen(false);
    setEditingBudgetSetup(null);
    setFormError(null);
  };

  const buildPayload = (formValues: BudgetSetupFormState): BudgetSetupMutationPayload | null => {
    const parsedAccountId = Number(formValues.accountId);
    const parsedAmount = Number(formValues.amount);

    if (!parsedAccountId || !formValues.date || !formValues.description.trim()) {
      setFormError(t('budgetSetups.requiredError'));
      return null;
    }

    if (Number.isNaN(parsedAmount)) {
      setFormError(t('budgetSetups.amountInvalid'));
      return null;
    }

    if (formValues.isRepeatle && !formValues.repeatFrequency) {
      setFormError(t('budgetSetups.repeatFrequencyRequired'));
      return null;
    }

    setFormError(null);

    return {
      accountId: parsedAccountId,
      date: formValues.date,
      isRepeatle: formValues.isRepeatle,
      repeatFrequency: formValues.isRepeatle ? formValues.repeatFrequency : undefined,
      endDate: formValues.isRepeatle && formValues.endDate ? formValues.endDate : undefined,
      description: formValues.description.trim(),
      amount: parsedAmount,
      note: formValues.note.trim() || undefined,
    };
  };

  const handleSubmit = async (formValues: BudgetSetupFormState) => {
    const payload = buildPayload(formValues);

    if (!payload) {
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      if (editingBudgetSetup) {
        await dispatch(updateBudgetSetup({ id: editingBudgetSetup.id, payload })).unwrap();
        setActionMessage(t('budgetSetups.updated'));
      } else {
        await dispatch(createBudgetSetup(payload)).unwrap();
        setActionMessage(t('budgetSetups.created'));
      }

      reloadBudgetSetups(editingBudgetSetup ? page : 1);
      if (!editingBudgetSetup) {
        setPage(1);
      }
      setDialogOpen(false);
      setEditingBudgetSetup(null);
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (budgetSetup: BudgetSetupRecord) => {
    const confirmed = window.confirm(t('budgetSetups.deleteConfirm', { id: budgetSetup.id }));

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setActionMessage(null);

    try {
      await dispatch(deleteBudgetSetup(budgetSetup.id)).unwrap();

      if (data.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        reloadBudgetSetups();
      }

      setActionMessage(t('budgetSetups.deleted'));
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    }
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
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

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      )}

      {actionMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {actionMessage}
        </Alert>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('budgetSetups.empty')}</Alert>
      )}

      {data.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('transactions.columns.id')}</TableCell>
                  <TableCell>{t('budgetSetups.columns.account')}</TableCell>
                  <TableCell>{t('budgetSetups.columns.date')}</TableCell>
                  <TableCell>{t('budgetSetups.columns.isRepeatle')}</TableCell>
                  <TableCell>{t('budgetSetups.columns.repeatFrequency')}</TableCell>
                  <TableCell>{t('budgetSetups.columns.endDate')}</TableCell>
                  <TableCell>{t('budgetSetups.columns.description')}</TableCell>
                  <TableCell align="right">{t('budgetSetups.columns.amount')}</TableCell>
                  <TableCell>{t('budgetSetups.columns.note')}</TableCell>
                  <TableCell align="right">{t('budgetSetups.columns.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((budgetSetup) => (
                  <TableRow key={budgetSetup.id}>
                    <TableCell>{budgetSetup.id}</TableCell>
                    <TableCell>
                      {budgetSetup.accountCode} - {budgetSetup.accountName}
                    </TableCell>
                    <TableCell>{budgetSetup.date}</TableCell>
                    <TableCell>
                      {budgetSetup.isRepeatle ? t('common.yes') : t('common.no')}
                    </TableCell>
                    <TableCell>{budgetSetup.repeatFrequency || t('common.notAvailable')}</TableCell>
                    <TableCell>{budgetSetup.endDate || t('common.notAvailable')}</TableCell>
                    <TableCell>{budgetSetup.description}</TableCell>
                    <TableCell align="right">{formatCurrency(budgetSetup.amount)}</TableCell>
                    <TableCell>{budgetSetup.note || t('common.notAvailable')}</TableCell>
                    <TableCell align="right" sx={{ minWidth: 120 }}>
                      <IconButton
                        aria-label={t('budgetSetups.actions.editAria', { id: budgetSetup.id })}
                        onClick={() => handleEditClick(budgetSetup)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        aria-label={t('budgetSetups.actions.deleteAria', { id: budgetSetup.id })}
                        color="error"
                        onClick={() => handleDeleteClick(budgetSetup)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <PaginationControls
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

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
    </Box>
  );
};

export default BudgetSetupListPage;
