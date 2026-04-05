import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Container,
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
import type { BudgetDetailRequest, BudgetFormState, BudgetMutationPayload, BudgetRecord } from './types';
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

const BudgetListPage: React.FC = () => {
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
  const [pageSize, setPageSize] = useState(10);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetRecord | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generateEndDate, setGenerateEndDate] = useState(getCurrentLocalDate());
  const [generateOnlyForFuture, setGenerateOnlyForFuture] = useState(true);
  const [form, setForm] = useState<BudgetFormState>({
    accountId: '',
    date: getCurrentLocalDate(),
    amount: '',
    description: '',
    processed: false,
    note: '',
  });

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

  const resetForm = (budget: BudgetRecord | null) => {
    setForm({
      accountId: budget ? String(budget.accountId) : accounts[0] ? String(accounts[0].id) : '',
      date: budget?.date ?? getCurrentLocalDate(),
      amount: budget ? String(budget.amount) : '',
      description: budget?.description ?? '',
      processed: budget?.processed ?? false,
      note: budget?.note ?? '',
    });
    setFormError(null);
  };

  const handleCreateClick = () => {
    setEditingBudget(null);
    resetForm(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleEditClick = (budget: BudgetRecord) => {
    setEditingBudget(budget);
    resetForm(budget);
    setActionError(null);
    setActionMessage(null);
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
    setGenerateOnlyForFuture(true);
    setFormError(null);
  };

  const handleFormChange = (field: keyof BudgetFormState, value: BudgetFormState[keyof BudgetFormState]) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const buildPayload = (): BudgetMutationPayload | null => {
    const parsedAccountId = Number(form.accountId);
    const parsedAmount = Number(form.amount);

    if (!parsedAccountId || !form.date || !form.description.trim()) {
      setFormError('Account, date, and description are required.');
      return null;
    }

    if (Number.isNaN(parsedAmount)) {
      setFormError('Amount must be a valid number.');
      return null;
    }

    setFormError(null);

    return {
      accountId: parsedAccountId,
      date: form.date,
      amount: parsedAmount,
      description: form.description.trim(),
      processed: form.processed,
      note: form.note.trim() || undefined,
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();

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
      setActionMessage(editingBudget ? 'Budget updated.' : 'Budget created.');
      setDialogOpen(false);
      setEditingBudget(null);
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = async (budget: BudgetRecord) => {
    const confirmed = window.confirm(`Delete budget ${budget.id}?`);

    if (!confirmed) {
      return;
    }

    setActionError(null);
    setActionMessage(null);

    try {
      await dispatch(deleteBudget(budget.id)).unwrap();

      if (data.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        reloadBudgetMonths();
      }

      refreshMonthDetails(getMonthRequestFromDate(budget.date));
      setActionMessage('Budget deleted.');
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    }
  };

  const handleGenerateSubmit = async () => {
    if (!generateEndDate) {
      setFormError('End date is required.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    setFormError(null);

    try {
      const createdCount = await dispatch(
        generateBudgets({
          endDate: generateEndDate,
          generateOnlyForFuture,
        })
      ).unwrap();
      reloadBudgetMonths(1);
      setPage(1);
      setGenerateDialogOpen(false);
      setGenerateOnlyForFuture(true);
      setActionMessage(`Generated ${createdCount} budgets.`);
    } catch (generateError) {
      setActionError(generateError instanceof Error ? generateError.message : String(generateError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleRow = (year: number, month: number) => {
    const request = { year, month };
    const key = getBudgetDetailKey(request);
    const isExpanded = expandedKeys[key] === true;

    setExpandedKeys((current) => ({
      ...current,
      [key]: !isExpanded,
    }));

    if (!isExpanded) {
      dispatch(fetchBudgetDetails(request));
    }
  };

  const isSetupLocked = editingBudget?.isRepeatle ?? false;

  return (
    <Container sx={{ mt: 4 }}>
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
          Budget
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="outlined" onClick={() => setGenerateDialogOpen(true)}>
            Generate Budgets
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
            Create Budget
          </Button>
        </Box>
      </Box>

      {accountsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load accounts: {accountsError}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load budgets: {error}
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

      {!loading && !error && data.length === 0 && <Alert severity="info">No budgets found.</Alert>}

      {data.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell width={64} />
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Total</TableCell>
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
                            aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
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
                              {detailState && !detailState.loading && detailState.data.length === 0 && (
                                <Alert severity="info">No budgets found for this month.</Alert>
                              )}
                              {detailState && detailState.data.length > 0 && (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Date</TableCell>
                                      <TableCell>Account</TableCell>
                                      <TableCell>Description</TableCell>
                                      <TableCell>Frequency</TableCell>
                                      <TableCell>Processed</TableCell>
                                      <TableCell align="right">Amount</TableCell>
                                      <TableCell>Note</TableCell>
                                      <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {detailState.data.map((budget) => (
                                      <TableRow key={budget.id}>
                                        <TableCell>{budget.date}</TableCell>
                                        <TableCell>{budget.accountCode} - {budget.accountName}</TableCell>
                                        <TableCell>{budget.description}</TableCell>
                                        <TableCell>
                                          {budget.repeatFrequency || (budget.isRepeatle ? 'Repeating' : 'One-time')}
                                        </TableCell>
                                        <TableCell>{budget.processed ? 'Yes' : 'No'}</TableCell>
                                        <TableCell align="right">{formatCurrency(budget.amount)}</TableCell>
                                        <TableCell>{budget.note || '-'}</TableCell>
                                        <TableCell align="right" sx={{ minWidth: 120 }}>
                                          <IconButton
                                            aria-label={`edit budget ${budget.id}`}
                                            onClick={() => handleEditClick(budget)}
                                          >
                                            <EditIcon />
                                          </IconButton>
                                          <IconButton
                                            aria-label={`delete budget ${budget.id}`}
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
        form={form}
        formError={formError}
        isSubmitting={isSubmitting || accountsLoading}
        accounts={accounts}
        isSetupLocked={isSetupLocked}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        onFormChange={handleFormChange}
      />

      <BudgetGenerateDialog
        open={generateDialogOpen}
        endDate={generateEndDate}
        generateOnlyForFuture={generateOnlyForFuture}
        formError={formError}
        isSubmitting={isSubmitting}
        onClose={handleGenerateDialogClose}
        onEndDateChange={setGenerateEndDate}
        onGenerateOnlyForFutureChange={setGenerateOnlyForFuture}
        onSubmit={handleGenerateSubmit}
      />
    </Container>
  );
};

export default BudgetListPage;