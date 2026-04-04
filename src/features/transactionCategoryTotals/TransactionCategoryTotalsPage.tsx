import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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

const monthOptions = [
  { value: '', label: 'All Months' },
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

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
  const dispatch = useDispatch<AppDispatch>();
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useSelector((state: RootState) => state.categories);
  const { data, loading, error, detailsByKey, pagination } = useSelector(
    (state: RootState) => state.transactionCategoryTotals
  );
  const [month, setMonth] = useState<number | null>(null);
  const [year, setYear] = useState<number | null>(null);
  const [yearInput, setYearInput] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

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
        Transactions By Category
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 220 }}>
            <InputLabel>Select Month</InputLabel>
            <Select
              value={month ?? ''}
              onChange={(event) => {
                setMonth(event.target.value ? Number(event.target.value) : null);
                setPage(1);
              }}
              label="Select Month"
            >
              {monthOptions.map((option) => (
                <MenuItem key={String(option.value)} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Year"
            type="number"
            value={yearInput}
            onChange={(event) => {
              const nextValue = event.target.value;
              setYearInput(nextValue);
              debouncedApplyYear(nextValue);
            }}
            sx={{ width: 180 }}
          />

          <FormControl sx={{ minWidth: 260 }}>
            <InputLabel>Select Category</InputLabel>
            <Select
              value={categoryId ?? ''}
              onChange={(event) => {
                setCategoryId(event.target.value ? Number(event.target.value) : null);
                setPage(1);
              }}
              label="Select Category"
              disabled={categoriesLoading}
            >
              <MenuItem value="">
                <em>All Categories</em>
              </MenuItem>
              {categoriesLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Loading categories...
                </MenuItem>
              ) : (
                categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Button variant="contained" onClick={handleReload} disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Reload'}
          </Button>
        </Box>
      </Paper>

      {categoriesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load categories: {categoriesError}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load category totals: {error}
        </Alert>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">No category totals found.</Alert>
      )}

      {data.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Month</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Total</TableCell>
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
                            aria-label={expanded ? 'Collapse row' : 'Expand row'}
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
                                Total Details
                              </Typography>

                              {detailsState.loading && <CircularProgress size={24} />}

                              {detailsState.error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                  Failed to load details: {detailsState.error}
                                </Alert>
                              )}

                              {!detailsState.loading &&
                                !detailsState.error &&
                                detailsState.data.length === 0 && (
                                  <Alert severity="info">No detail rows found.</Alert>
                                )}

                              {detailsState.data.length > 0 && (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>ID</TableCell>
                                      <TableCell>Type</TableCell>
                                      <TableCell>Description</TableCell>
                                      <TableCell>Date</TableCell>
                                      <TableCell>Note</TableCell>
                                      <TableCell>Category</TableCell>
                                      <TableCell align="right">Amount</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {detailsState.data.map((detail) => (
                                      <TableRow key={`${detail.type}-${detail.id}`}>
                                        <TableCell>{detail.id}</TableCell>
                                        <TableCell>{detail.type}</TableCell>
                                        <TableCell>{detail.description}</TableCell>
                                        <TableCell>{formatDateTime(detail.datetime)}</TableCell>
                                        <TableCell>{detail.note || '-'}</TableCell>
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
