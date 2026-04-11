import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Collapse,
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
import ConfirmDialog from '../../components/ConfirmDialog';
import FeedbackSnackbar from '../../components/FeedbackSnackbar';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import { fetchAccounts } from '../accounts/accountsSlice';
import PaginationControls from '../../components/PaginationControls';
import type { RootState, AppDispatch } from '../../store';
import { formatCurrency } from '../../utils/currencyUtils';
import {
  createBudget,
  deleteBudget,
  fetchBudgetDetails,
  fetchBudgetMonthTotals,
  generateBudgets,
  updateBudget,
} from './budgetSlice';
import BudgetFormDialog from './BudgetFormDialog';
import BudgetGenerateDialog from './BudgetGenerateDialog';
import type {
  BudgetDetailRequest,
  BudgetFormState,
  BudgetMutationPayload,
  BudgetRecord,
} from './types';
import { getBudgetDetailKey } from './types';

const getCurrentLocalDate = (): string => {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 10);
};

const getMonthRequestFromDate = (dateValue: string): BudgetDetailRequest => {
  const [year, month] = dateValue.split('-').map(Number);
  return { year, month };
};

const buildBudgetFormDefaults = (
  budget: BudgetRecord | null,
  accountOptions: RootState['accounts']['data']
): BudgetFormState => ({
  accountId: budget
    ? String(budget.accountId)
    : accountOptions[0]
      ? String(accountOptions[0].id)
      : '',
  date: budget?.date ?? getCurrentLocalDate(),
  amount: budget ? String(budget.amount) : '',
  description: budget?.description ?? '',
  processed: budget?.processed ?? false,
  note: budget?.note ?? '',
});

const BudgetListPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error, detailsByKey, pagination } = useSelector(
    (state: RootState) => state.budgets
  );
  const {
    data: accounts,
    loading: accountsLoading,
    error: accountsError,
  } = useSelector((state: RootState) => state.accounts);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchBudgetMonthTotals({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  const reloadBudgetMonths = (nextPage = page) => {
    dispatch(fetchBudgetMonthTotals({ page: nextPage, pageSize }));
  };

  const refreshMonthDetails = (request: BudgetDetailRequest) => {
    dispatch(fetchBudgetDetails(request));
  };

  const handleCreateClick = () => {
    setEditingBudget(null);
    setActionError(null);
    setActionMessage(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleEditClick = (budget: BudgetRecord) => {
    setEditingBudget(budget);
    setActionError(null);
    setActionMessage(null);
    setFormError(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (isSubmitting) {
      return;
    }

    setDialogOpen(false);
    setEditingBudget(null);
    setFormError(null);
  };

  const handleGenerateDialogClose = () => {
    if (isSubmitting) {
      return;
    }

    setGenerateDialogOpen(false);
    setFormError(null);
  };

  const buildPayload = (formValues: BudgetFormState): BudgetMutationPayload | null => {
    const parsedAccountId = Number(formValues.accountId);
    const parsedAmount = Number(formValues.amount);

    if (!parsedAccountId || !formValues.date || !formValues.description.trim()) {
      setFormError(t('budgets.requiredError'));
      return null;
    }

    if (Number.isNaN(parsedAmount)) {
      setFormError(t('budgets.amountInvalid'));
      return null;
    }

    setFormError(null);

    return {
      accountId: parsedAccountId,
      date: formValues.date,
      amount: parsedAmount,
      description: formValues.description.trim(),
      processed: formValues.processed,
      note: formValues.note.trim() || undefined,
    };
  };

  const handleSubmit = async (formValues: BudgetFormState) => {
    const payload = buildPayload(formValues);

    if (!payload) {
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      const oldMonthRequest = editingBudget ? getMonthRequestFromDate(editingBudget.date) : null;
      const newMonthRequest = getMonthRequestFromDate(payload.date);

      if (editingBudget) {
        await dispatch(updateBudget({ id: editingBudget.id, payload })).unwrap();
      } else {
        await dispatch(createBudget(payload)).unwrap();
      }

      reloadBudgetMonths();

      if (oldMonthRequest) {
        refreshMonthDetails(oldMonthRequest);
      }

      refreshMonthDetails(newMonthRequest);
      setActionMessage(editingBudget ? t('budgets.updated') : t('budgets.created'));
      setDialogOpen(false);
      setEditingBudget(null);
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  type ConfirmPayload = { id: number; date?: string; title?: string; content?: string };
  const { open: confirmOpen, payload: confirmPayload, openConfirm, closeConfirm } =
    useConfirmDialog<ConfirmPayload>();

  const handleDeleteClick = async (budget: BudgetRecord) => {
    openConfirm({
      id: budget.id,
      date: budget.date,
      title: t('budgets.deleteConfirm', { id: budget.id }),
      content: t('budgets.deleteConfirm', { id: budget.id }),
    });
  };

  const closeFeedback = () => {
    setActionError(null);
    setActionMessage(null);
  };

  const handleConfirm = async () => {
    if (!confirmPayload) return closeConfirm();
    setActionError(null);
    setActionMessage(null);
    try {
      await dispatch(deleteBudget(confirmPayload.id)).unwrap();
      if (data.length === 1 && page > 1) setPage(page - 1);
      else reloadBudgetMonths();
      if (confirmPayload.date) refreshMonthDetails(getMonthRequestFromDate(confirmPayload.date));
      setActionMessage(t('budgets.deleted'));
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      closeConfirm();
    }
  };

  const handleGenerateSubmit = async ({
    startDate,
    endDate,
  }: {
    startDate: string;
    endDate: string;
  }) => {
    if (!endDate) {
      setFormError(t('budgets.endDateRequired'));
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    setFormError(null);

    try {
      const createdCount = await dispatch(
        generateBudgets({
          startDate,
          endDate,
        })
      ).unwrap();
      reloadBudgetMonths(1);
      setPage(1);
      setGenerateDialogOpen(false);
      setActionMessage(t('budgets.generated', { count: createdCount }));
    } catch (generateError) {
      setActionError(
        generateError instanceof Error ? generateError.message : String(generateError)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRow = (year: number, month: number) => {
    const request = { year, month };
    const key = getBudgetDetailKey(request);
    const isExpanded = expandedKeys[key] === true;
    const nextExpanded = !isExpanded;

    setExpandedKeys((current) => ({
      ...current,
      [key]: nextExpanded,
    }));

    // Always refresh details when the month row is expanded to show up-to-date data
    if (nextExpanded) {
      dispatch(fetchBudgetDetails(request));
    }
  };

  const isSetupLocked = editingBudget?.isRepeatle ?? false;

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
          {t('budgets.title')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => setGenerateDialogOpen(true)}>
            {t('budgets.generate')}
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
            {t('budgets.create')}
          </Button>
        </Box>
      </Box>

      {accountsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('budgets.failedLoadAccounts', { error: accountsError })}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('budgets.failedLoadBudgets', { error })}
        </Alert>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('budgets.empty')}</Alert>
      )}

      {data.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width={64} />
                  <TableCell>{t('budgets.columns.month')}</TableCell>
                  <TableCell align="right">{t('budgets.columns.total')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => {
                  const key = getBudgetDetailKey({ year: row.year, month: row.month });
                  const detailState = detailsByKey[key];
                  const isExpanded = expandedKeys[key] === true;

                  return (
                    <React.Fragment key={key}>
                      <TableRow>
                        <TableCell>
                          <IconButton
                            aria-label={
                              isExpanded ? t('common.collapseRow') : t('common.expandRow')
                            }
                            onClick={() => handleToggleRow(row.year, row.month)}
                          >
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{row.monthLabel}</TableCell>
                        <TableCell align="right">{formatCurrency(row.totalAmount)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} sx={{ py: 0, borderBottom: 0 }}>
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: 'background.default' }}>
                              {detailState?.loading && <CircularProgress size={24} />}
                              {detailState?.error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                  {detailState.error}
                                </Alert>
                              )}
                              {detailState &&
                                !detailState.loading &&
                                detailState.data.length === 0 && (
                                  <Alert severity="info">{t('budgets.monthEmpty')}</Alert>
                                )}
                              {detailState && detailState.data.length > 0 && (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>{t('budgets.columns.date')}</TableCell>
                                      <TableCell>{t('budgets.columns.account')}</TableCell>
                                      <TableCell>{t('budgets.columns.description')}</TableCell>
                                      <TableCell>{t('budgets.columns.frequency')}</TableCell>
                                      <TableCell>{t('budgets.columns.processed')}</TableCell>
                                      <TableCell align="right">
                                        {t('budgets.columns.amount')}
                                      </TableCell>
                                      <TableCell>{t('budgets.columns.note')}</TableCell>
                                      <TableCell align="right">
                                        {t('budgets.columns.actions')}
                                      </TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {detailState.data.map((budget) => (
                                      <TableRow key={budget.id}>
                                        <TableCell>{budget.date}</TableCell>
                                        <TableCell>
                                          {budget.accountCode} - {budget.accountName}
                                        </TableCell>
                                        <TableCell>{budget.description}</TableCell>
                                        <TableCell>
                                          {budget.repeatFrequency ||
                                            (budget.isRepeatle
                                              ? t('budgets.repeating')
                                              : t('budgets.oneTime'))}
                                        </TableCell>
                                        <TableCell>
                                          {budget.processed ? t('common.yes') : t('common.no')}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(budget.amount)}
                                        </TableCell>
                                        <TableCell>
                                          {budget.note || t('common.notAvailable')}
                                        </TableCell>
                                        <TableCell align="right" sx={{ minWidth: 120 }}>
                                          <IconButton
                                            aria-label={t('budgets.actions.editAria', {
                                              id: budget.id,
                                            })}
                                            onClick={() => handleEditClick(budget)}
                                          >
                                            <EditIcon />
                                          </IconButton>
                                          <IconButton
                                            aria-label={t('budgets.actions.deleteAria', {
                                              id: budget.id,
                                            })}
                                            color="error"
                                            onClick={() => handleDeleteClick(budget)}
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <PaginationControls
            page={pagination.page}
            pageSize={pagination.pageSize}
            totalCount={pagination.totalCount}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(1);
            }}
          />
        </>
      )}

      <BudgetFormDialog
        open={dialogOpen}
        editingBudget={editingBudget}
        initialValues={buildBudgetFormDefaults(editingBudget, accounts)}
        formError={formError}
        isSubmitting={isSubmitting || accountsLoading}
        accounts={accounts}
        isSetupLocked={isSetupLocked}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
      />

      <BudgetGenerateDialog
        open={generateDialogOpen}
        formError={formError}
        isSubmitting={isSubmitting}
        onClose={handleGenerateDialogClose}
        onSubmit={handleGenerateSubmit}
      />
      <ConfirmDialog
        open={confirmOpen}
        title={
          confirmPayload?.title ?? t('budgets.deleteConfirm', { id: confirmPayload?.id ?? '' })
        }
        content={
          confirmPayload?.content ?? t('budgets.deleteConfirm', { id: confirmPayload?.id ?? '' })
        }
        confirmText={t('common.yes') || 'Delete'}
        cancelText={t('common.no') || 'Cancel'}
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

export default BudgetListPage;
