import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';
import {
  Alert,
  Box,
  CircularProgress,
  Collapse,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Button,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PaginationControls from '../../components/PaginationControls';
import { fetchCategories } from '../categories/categoriesSlice';
import {
  fetchTransactionCategoryTotalDetails,
  fetchTransactionCategoryTotals,
} from './transactionCategoryTotalsSlice';
import type { TransactionCategoryTotal, TransactionCategoryTotalDetailRequest } from './types';
import { getTransactionCategoryDetailKey } from './types';
import type { RootState, AppDispatch } from '../../store';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDateTime } from '../../utils/dateUtils';

interface TransactionCategoryTotalsFilterFormValues {
  month: string;
  year: string;
  categoryId: string;
}

const buildDetailRequest = (
  row: TransactionCategoryTotal
): TransactionCategoryTotalDetailRequest => ({
  year: row.year,
  month: row.month,
  categoryId: row.categoryId,
});

const parseYear = (value: string): number | null => {
  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return null;
  }

  const parsedYear = Number(trimmedValue);
  return Number.isNaN(parsedYear) ? null : parsedYear;
};

const TransactionCategoryTotalsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state: RootState) => state.categories);
  const { data, loading, error, detailsByKey, pagination } = useSelector(
    (state: RootState) => state.transactionCategoryTotals
  );
  const { control } = useForm<TransactionCategoryTotalsFilterFormValues>({
    defaultValues: {
      month: '',
      year: '',
      categoryId: '',
    },
  });
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const values = useWatch({ control });
  const monthOptions = [
    { value: '', label: t('common.allMonths') },
    { value: 1, label: t('months.january') },
    { value: 2, label: t('months.february') },
    { value: 3, label: t('months.march') },
    { value: 4, label: t('months.april') },
    { value: 5, label: t('months.may') },
    { value: 6, label: t('months.june') },
    { value: 7, label: t('months.july') },
    { value: 8, label: t('months.august') },
    { value: 9, label: t('months.september') },
    { value: 10, label: t('months.october') },
    { value: 11, label: t('months.november') },
    { value: 12, label: t('months.december') },
  ];

  const debouncedApplyYear = useDebouncedCallback((value: string) => {
    const nextYear = parseYear(value);

    setYear(nextYear);
    setPage(1);
  }, 600);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchTransactionCategoryTotals({ month, year, categoryId, page, pageSize }));
  }, [dispatch, month, year, categoryId, page, pageSize]);

  useEffect(() => {
    const nextMonth = values.month ? Number(values.month) : null;

    if (nextMonth !== month) {
      setMonth(nextMonth);
      setPage(1);
    }
  }, [month, values.month]);

  useEffect(() => {
    const nextCategoryId = values.categoryId ? Number(values.categoryId) : null;

    if (nextCategoryId !== categoryId) {
      setCategoryId(nextCategoryId);
      setPage(1);
    }
  }, [categoryId, values.categoryId]);

  useEffect(() => {
    debouncedApplyYear(values.year || '');
  }, [debouncedApplyYear, values.year]);

  useEffect(() => () => debouncedApplyYear.cancel(), [debouncedApplyYear]);

  const handleReload = () => {
    dispatch(fetchTransactionCategoryTotals({ month, year, categoryId, page, pageSize }));
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const handleToggleRow = (row: TransactionCategoryTotal) => {
    const request = buildDetailRequest(row);
    const key = getTransactionCategoryDetailKey(request);
    const isExpanded = expandedKeys[key] === true;

    setExpandedKeys((current) => ({
      ...current,
      [key]: !isExpanded,
    }));

    if (!isExpanded) {
      dispatch(fetchTransactionCategoryTotalDetails(request));
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('transactionCategoryTotals.title')}
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>{t('transactionCategoryTotals.filters.month')}</InputLabel>
            <Controller
              control={control}
              name="month"
              render={({ field }) => (
                <Select {...field} label={t('transactionCategoryTotals.filters.month')}>
                  {monthOptions.map((option) => (
                    <MenuItem key={String(option.value)} value={String(option.value)}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
          </FormControl>

          <Controller
            control={control}
            name="year"
            render={({ field }) => (
              <TextField
                {...field}
                label={t('transactionCategoryTotals.filters.year')}
                type="number"
                sx={{ width: 180 }}
              />
            )}
          />

          <FormControl sx={{ minWidth: 260 }}>
            <InputLabel>{t('transactionCategoryTotals.filters.category')}</InputLabel>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  {...field}
                  label={t('transactionCategoryTotals.filters.category')}
                  disabled={categoriesLoading}
                >
                  <MenuItem value="">
                    <em>{t('common.allCategories')}</em>
                  </MenuItem>
                  {categoriesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      {t('common.loadingCategories')}
                    </MenuItem>
                  ) : (
                    categories.map((category) => (
                      <MenuItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              )}
            />
          </FormControl>

          <Button variant="contained" onClick={handleReload} disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : t('common.reload')}
          </Button>
        </Box>
      </Paper>

      {categoriesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('transactionCategoryTotals.failedLoadCategories', { error: categoriesError })}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('transactionCategoryTotals.failedLoadTotals', { error })}
        </Alert>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('transactionCategoryTotals.empty')}</Alert>
      )}

      {data.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>{t('transactionCategoryTotals.columns.month')}</TableCell>
                  <TableCell>{t('transactionCategoryTotals.columns.category')}</TableCell>
                  <TableCell align="right">{t('transactionCategoryTotals.columns.total')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => {
                  const request = buildDetailRequest(row);
                  const key = getTransactionCategoryDetailKey(request);
                  const detailsState = detailsByKey[key] || {
                    loading: false,
                    error: null,
                    data: [],
                  };
                  const expanded = expandedKeys[key] === true;

                  return (
                    <React.Fragment key={key}>
                      <TableRow>
                        <TableCell sx={{ width: 72 }}>
                          <IconButton
                            aria-label={expanded ? t('common.collapseRow') : t('common.expandRow')}
                            size="small"
                            onClick={() => handleToggleRow(row)}
                          >
                            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{row.monthLabel}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell align="right">{formatCurrency(row.totalAmount)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell sx={{ py: 0 }} colSpan={4}>
                          <Collapse in={expanded} timeout="auto" unmountOnExit>
                            <Box sx={{ m: 2 }}>
                              <Typography variant="h6" gutterBottom>
                                {t('transactionCategoryTotals.title')}
                              </Typography>

                              {detailsState.loading && <CircularProgress size={24} />}

                              {detailsState.error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                  {detailsState.error}
                                </Alert>
                              )}

                              {!detailsState.loading &&
                                !detailsState.error &&
                                detailsState.data.length === 0 && (
                                  <Alert severity="info">{t('transactionCategoryTotals.detailsEmpty')}</Alert>
                                )}

                              {detailsState.data.length > 0 && (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>{t('transactions.columns.id')}</TableCell>
                                      <TableCell>{t('transactionCategoryTotals.columns.type')}</TableCell>
                                      <TableCell>{t('transactionCategoryTotals.columns.description')}</TableCell>
                                      <TableCell>{t('transactionCategoryTotals.columns.datetime')}</TableCell>
                                      <TableCell>{t('transactionCategoryTotals.columns.note')}</TableCell>
                                      <TableCell>{t('transactionCategoryTotals.columns.category')}</TableCell>
                                      <TableCell align="right">{t('transactionCategoryTotals.columns.amount')}</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {detailsState.data.map((detail) => (
                                      <TableRow key={`${detail.type}-${detail.id}`}>
                                        <TableCell>{detail.id}</TableCell>
                                        <TableCell>{detail.type}</TableCell>
                                        <TableCell>{detail.description}</TableCell>
                                        <TableCell>{formatDateTime(detail.datetime)}</TableCell>
                                        <TableCell>{detail.note || t('common.notAvailable')}</TableCell>
                                        <TableCell>{detail.category}</TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(detail.amount)}
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
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}
    </Box>
  );
};

export default TransactionCategoryTotalsPage;
