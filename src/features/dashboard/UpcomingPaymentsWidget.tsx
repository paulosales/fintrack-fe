import React from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import type { Account } from '../../models/accounts';
import type { Transaction } from '../transactions/types';
import {
  CadenceType,
  computeForecastSummary,
  formatRelativeDueDays,
  predictUpcomingPayments,
} from './paymentForecast';
import { formatCurrency } from '../../utils/currencyUtils';

const STORAGE_KEY = 'fintrack-forecast-tracked-streams';

const loadTrackedStreamKeys = (): Set<string> | null => {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage?.getItem?.(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed);
    }
  } catch {
    // ignore
  }
  return null;
};

const saveTrackedStreamKeys = (keys: Set<string> | null) => {
  try {
    if (typeof window !== 'undefined') {
      if (keys === null) {
        window.localStorage?.removeItem?.(STORAGE_KEY);
      } else {
        window.localStorage?.setItem?.(STORAGE_KEY, JSON.stringify(Array.from(keys)));
      }
    }
  } catch {
    // ignore
  }
};

export interface UpcomingPaymentsWidgetProps {
  transactions: Transaction[];
  accounts: Account[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  defaultWindowDays?: number;
}

export const UpcomingPaymentsWidget: React.FC<UpcomingPaymentsWidgetProps> = ({
  transactions,
  accounts,
  loading = false,
  error = null,
  onRefresh,
  defaultWindowDays = 30,
}) => {
  const [windowDays, setWindowDays] = React.useState<number>(defaultWindowDays);
  const [viewFilter, setViewFilter] = React.useState<'tracked' | 'expense' | 'income' | 'all'>('tracked');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const [sortField, setSortField] = React.useState<'nextDate' | 'amount' | 'description'>('nextDate');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Tracked stream keys persisted in localStorage
  const [trackedStreamKeys, setTrackedStreamKeys] = React.useState<Set<string> | null>(() =>
    loadTrackedStreamKeys()
  );

  // Compute predictions
  const allPredictions = React.useMemo(() => {
    if (!transactions.length) return [];
    return predictUpcomingPayments(transactions, accounts, {
      windowDays,
      referenceDate: new Date(),
      trackedStreamKeys: trackedStreamKeys ?? undefined,
    });
  }, [transactions, accounts, windowDays, trackedStreamKeys]);

  // High-level summary metrics
  const summary = React.useMemo(() => {
    return computeForecastSummary(allPredictions);
  }, [allPredictions]);

  // Distinct tracked streams count
  const trackedStreamsCount = React.useMemo(() => {
    const keys = new Set(allPredictions.filter((p) => p.isTracked).map((p) => p.streamKey));
    return keys.size;
  }, [allPredictions]);

  // Toggle tracking for a specific streamKey
  const handleToggleTracked = React.useCallback(
    (streamKey: string) => {
      setTrackedStreamKeys((prev) => {
        // If no explicit preferences stored yet, initialize from current predictions
        const currentSet = new Set(
          prev !== null
            ? prev
            : allPredictions.filter((p) => p.isTracked).map((p) => p.streamKey)
        );

        if (currentSet.has(streamKey)) {
          currentSet.delete(streamKey);
        } else {
          currentSet.add(streamKey);
        }

        saveTrackedStreamKeys(currentSet);
        return currentSet;
      });
    },
    [allPredictions]
  );

  // Reset to default smart tracking
  const handleResetTracked = React.useCallback(() => {
    saveTrackedStreamKeys(null);
    setTrackedStreamKeys(null);
  }, []);

  // Filtered & sorted predictions
  const filteredPredictions = React.useMemo(() => {
    let result = [...allPredictions];

    if (viewFilter === 'tracked') {
      result = result.filter((p) => p.isTracked && p.flowType === 'expense');
    } else if (viewFilter === 'expense') {
      result = result.filter((p) => p.flowType === 'expense');
    } else if (viewFilter === 'income') {
      result = result.filter((p) => p.flowType === 'income');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.description.toLowerCase().includes(q) ||
          p.accountName.toLowerCase().includes(q) ||
          (p.accountCode && p.accountCode.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      // Rule: Tracked / Important items ALWAYS come first!
      const aTracked = a.isTracked ? 1 : 0;
      const bTracked = b.isTracked ? 1 : 0;
      if (aTracked !== bTracked) {
        return bTracked - aTracked;
      }

      // Secondary sorting within tracked group and untracked group
      let cmp = 0;
      if (sortField === 'nextDate') {
        cmp = a.nextDate.localeCompare(b.nextDate);
      } else if (sortField === 'amount') {
        cmp = a.amount - b.amount;
      } else if (sortField === 'description') {
        cmp = a.description.localeCompare(b.description);
      }
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [allPredictions, viewFilter, searchQuery, sortField, sortDirection]);

  const displayedPredictions = isExpanded
    ? filteredPredictions
    : filteredPredictions.slice(0, 7);

  const handleSort = (field: 'nextDate' | 'amount' | 'description') => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'amount' ? 'desc' : 'asc');
    }
  };

  const getUrgencyChipProps = (daysUntilDue: number) => {
    if (daysUntilDue <= 1) {
      return {
        color: 'error' as const,
        variant: 'filled' as const,
      };
    }
    if (daysUntilDue <= 7) {
      return {
        color: 'warning' as const,
        variant: 'filled' as const,
      };
    }
    if (daysUntilDue <= 14) {
      return {
        color: 'info' as const,
        variant: 'outlined' as const,
      };
    }
    return {
      color: 'default' as const,
      variant: 'outlined' as const,
    };
  };

  const getCadenceColor = (cadence: CadenceType) => {
    switch (cadence) {
      case 'Weekly':
        return '#8B5CF6';
      case 'Bi-weekly':
        return '#0284C7';
      case 'Monthly':
        return '#2563EB';
      case 'Quarterly':
        return '#059669';
      default:
        return '#64748B';
    }
  };

  return (
    <Paper
      elevation={0}
      data-testid="upcoming-payments-widget"
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 4,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)'
            : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 8px 32px rgba(0, 0, 0, 0.45)'
            : '0 8px 24px rgba(148, 163, 184, 0.12)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* ── Widget Header ────────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2.5,
              background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              color: '#ffffff',
              boxShadow: '0 6px 16px rgba(59, 130, 246, 0.35)',
            }}
          >
            <CalendarMonthIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
              <Typography variant="h5" component="h2" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                Upcoming Payments Forecast
              </Typography>
              <Chip
                size="small"
                label={`Next ${windowDays} Days`}
                color="primary"
                sx={{ fontWeight: 600, fontSize: '0.75rem', px: 0.5 }}
              />
              {trackedStreamKeys !== null && (
                <Chip
                  size="small"
                  icon={<StarIcon sx={{ fontSize: '13px !important', color: '#F59E0B !important' }} />}
                  label="Custom Tracked"
                  variant="outlined"
                  sx={{ fontWeight: 600, fontSize: '0.72rem', borderColor: '#F59E0B' }}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Track critical upcoming obligations (insurance, credit cards, rent, mortgage, loans). Star payments to prioritize them.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ alignSelf: { xs: 'stretch', md: 'auto' } }}>
          <ToggleButtonGroup
            size="small"
            value={windowDays}
            exclusive
            onChange={(_, val) => val && setWindowDays(val)}
            aria-label="forecast timeframe"
            sx={{
              '& .MuiToggleButton-root': {
                px: 1.5,
                py: 0.5,
                fontWeight: 600,
                fontSize: '0.8rem',
                textTransform: 'none',
              },
            }}
          >
            <ToggleButton value={14}>14 Days</ToggleButton>
            <ToggleButton value={30}>30 Days</ToggleButton>
            <ToggleButton value={60}>60 Days</ToggleButton>
          </ToggleButtonGroup>

          {trackedStreamKeys !== null && (
            <Tooltip title="Reset to default tracked payments">
              <IconButton
                aria-label="Reset to default tracked payments"
                onClick={handleResetTracked}
                size="small"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                }}
              >
                <RestartAltIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}

          {onRefresh && (
            <Tooltip title="Refresh forecast data">
              <IconButton
                aria-label="Refresh forecast data"
                onClick={onRefresh}
                disabled={loading}
                size="small"
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                }}
              >
                <RefreshIcon
                  sx={{
                    animation: loading ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      {/* ── Error Banner ─────────────────────────────────────────── */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* ── Summary KPI Cards ────────────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3 }}
        useFlexGap
        flexWrap="wrap"
      >
        {/* Card 1: Tracked Payments Due */}
        <Card
          elevation={0}
          sx={{
            flex: '1 1 200px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)',
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Tracked Payments Due
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(239, 68, 68, 0.15)',
                  color: '#EF4444',
                }}
              >
                <ReceiptLongIcon sx={{ fontSize: 18 }} />
              </Box>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#DC2626' }}>
              {formatCurrency(summary.totalTrackedPayments)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {summary.trackedPaymentCount} important payments ({formatCurrency(summary.totalUpcomingPayments)} all bills)
            </Typography>
          </CardContent>
        </Card>

        {/* Card 2: Next Important Bill Due */}
        <Card
          elevation={0}
          sx={{
            flex: '1 1 200px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.04)',
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Next Important Bill
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(245, 158, 11, 0.15)',
                  color: '#D97706',
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 18 }} />
              </Box>
            </Stack>
            {summary.nextDueTrackedPayment ? (
              <>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatCurrency(summary.nextDueTrackedPayment.amount)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {summary.nextDueTrackedPayment.description} · {formatRelativeDueDays(summary.nextDueTrackedPayment.daysUntilDue)}
                </Typography>
              </>
            ) : summary.nextDuePayment ? (
              <>
                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatCurrency(summary.nextDuePayment.amount)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {summary.nextDuePayment.description} · {formatRelativeDueDays(summary.nextDuePayment.daysUntilDue)}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  None due
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  No upcoming payments in window
                </Typography>
              </>
            )}
          </CardContent>
        </Card>

        {/* Card 3: Average Tracked Payment */}
        <Card
          elevation={0}
          sx={{
            flex: '1 1 200px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.04)',
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Average Important Bill
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(99, 102, 241, 0.15)',
                  color: '#6366F1',
                }}
              >
                <TrendingDownIcon sx={{ fontSize: 18 }} />
              </Box>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#4F46E5' }}>
              {formatCurrency(
                summary.trackedPaymentCount > 0
                  ? summary.totalTrackedPayments / summary.trackedPaymentCount
                  : 0
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Avg per important payment
            </Typography>
          </CardContent>
        </Card>

        {/* Card 4: Active Tracked Streams */}
        <Card
          elevation={0}
          sx={{
            flex: '1 1 200px',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)',
          }}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Tracked Streams
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: 'rgba(16, 185, 129, 0.15)',
                  color: '#059669',
                }}
              >
                <AutorenewIcon sx={{ fontSize: 18 }} />
              </Box>
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#059669' }}>
              {trackedStreamsCount}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Starred recurring payees
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* ── Filter & Search Toolbar ──────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <ToggleButtonGroup
          size="small"
          value={viewFilter}
          exclusive
          onChange={(_, val) => val && setViewFilter(val)}
          aria-label="payment type filter"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.75,
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'none',
            },
          }}
        >
          <ToggleButton value="tracked" sx={{ gap: 0.75 }}>
            <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
            <span>Tracked Only ({summary.trackedPaymentCount})</span>
          </ToggleButton>
          <ToggleButton value="expense">
            All Bills ({summary.upcomingPaymentCount})
          </ToggleButton>
          <ToggleButton value="income">
            Income ({summary.upcomingIncomeCount})
          </ToggleButton>
          <ToggleButton value="all">
            All ({allPredictions.length})
          </ToggleButton>
        </ToggleButtonGroup>

        <TextField
          size="small"
          placeholder="Filter by description or account..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ minWidth: { xs: '100%', md: 280 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </Stack>

      {/* ── Loading State ────────────────────────────────────────── */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={36} />
        </Box>
      )}

      {/* ── Empty State ──────────────────────────────────────────── */}
      {!loading && displayedPredictions.length === 0 && (
        <Box
          sx={{
            py: 5,
            px: 2,
            textAlign: 'center',
            borderRadius: 2,
            border: '1px dashed',
            borderColor: 'divider',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 44, color: 'text.secondary', mb: 1, opacity: 0.6 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {viewFilter === 'tracked'
              ? 'No important payments currently tracked'
              : 'No upcoming payments found'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mt: 0.5 }}>
            {viewFilter === 'tracked'
              ? 'Switch to "All Bills" and click the star ⭐ next to any payment (such as MPI insurance, rent, or credit card bills) to track it here.'
              : searchQuery
                ? `No upcoming payments match "${searchQuery}". Try clearing your search.`
                : `No recurring payment patterns detected in the next ${windowDays} days.`}
          </Typography>
          {viewFilter === 'tracked' && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setViewFilter('expense')}
              sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Browse All Bills
            </Button>
          )}
        </Box>
      )}

      {/* ── Forecast Payments Table ──────────────────────────────── */}
      {!loading && displayedPredictions.length > 0 && (
        <TableContainer
          sx={{
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.5)' : '#ffffff'),
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc') }}>
                <TableCell sx={{ width: 48, py: 1.5, textAlign: 'center' }}>
                  <Tooltip title="Track / Prioritize">
                    <StarIcon sx={{ fontSize: 18, color: '#F59E0B', verticalAlign: 'middle' }} />
                  </Tooltip>
                </TableCell>
                <TableCell
                  onClick={() => handleSort('nextDate')}
                  sx={{ cursor: 'pointer', fontWeight: 700, py: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <span>Predicted Date</span>
                    {sortField === 'nextDate' &&
                      (sortDirection === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                      ))}
                  </Stack>
                </TableCell>
                <TableCell
                  onClick={() => handleSort('description')}
                  sx={{ cursor: 'pointer', fontWeight: 700, py: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <span>Description & Cadence</span>
                    {sortField === 'description' &&
                      (sortDirection === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                      ))}
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontWeight: 700, py: 1.5 }}>
                  Account
                </TableCell>
                <TableCell
                  align="right"
                  onClick={() => handleSort('amount')}
                  sx={{ cursor: 'pointer', fontWeight: 700, py: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5}>
                    <span>Forecast Amount</span>
                    {sortField === 'amount' &&
                      (sortDirection === 'asc' ? (
                        <ArrowUpwardIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <ArrowDownwardIcon sx={{ fontSize: 14 }} />
                      ))}
                  </Stack>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedPredictions.map((payment) => {
                const urgency = getUrgencyChipProps(payment.daysUntilDue);
                const isExpense = payment.flowType === 'expense';
                const isTracked = payment.isTracked;

                return (
                  <TableRow
                    key={payment.id}
                    hover
                    sx={{
                      bgcolor: isTracked
                        ? (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'rgba(245, 158, 11, 0.05)'
                              : 'rgba(254, 243, 199, 0.35)'
                        : 'inherit',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? isTracked
                              ? 'rgba(245, 158, 11, 0.1)'
                              : 'rgba(255, 255, 255, 0.04)'
                            : isTracked
                              ? 'rgba(254, 243, 199, 0.6)'
                              : 'rgba(59, 130, 246, 0.04)',
                      },
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    {/* Track / Star Button */}
                    <TableCell sx={{ py: 1.25, textAlign: 'center', width: 48 }}>
                      <Tooltip title={isTracked ? 'Marked as Important / Tracked (Click to untrack)' : 'Click to mark as Important / Tracked'}>
                        <IconButton
                          size="small"
                          aria-label={isTracked ? `Untrack ${payment.description}` : `Track ${payment.description}`}
                          onClick={() => handleToggleTracked(payment.streamKey)}
                          sx={{
                            color: isTracked ? '#F59E0B' : 'text.disabled',
                            '&:hover': { color: '#D97706', bgcolor: 'rgba(245, 158, 11, 0.1)' },
                          }}
                        >
                          {isTracked ? <StarIcon sx={{ fontSize: 20 }} /> : <StarBorderIcon sx={{ fontSize: 20 }} />}
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    {/* Due Date & Urgency Chip */}
                    <TableCell sx={{ py: 1.25 }}>
                      <Stack direction="row" alignItems="center" spacing={1.25}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {payment.nextDate}
                        </Typography>
                        <Chip
                          size="small"
                          label={formatRelativeDueDays(payment.daysUntilDue)}
                          color={urgency.color}
                          variant={urgency.variant}
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            height: 22,
                          }}
                        />
                      </Stack>
                    </TableCell>

                    {/* Description & Cadence */}
                    <TableCell sx={{ py: 1.25 }}>
                      <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {payment.description}
                        </Typography>
                        {isTracked && (
                          <Chip
                            size="small"
                            icon={<StarIcon sx={{ fontSize: '13px !important', color: '#B45309 !important' }} />}
                            label="Important"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: 'rgba(245, 158, 11, 0.15)',
                              color: '#B45309',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                            }}
                          />
                        )}
                        <Chip
                          size="small"
                          label={payment.cadence}
                          sx={{
                            height: 20,
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            bgcolor: `${getCadenceColor(payment.cadence)}15`,
                            color: getCadenceColor(payment.cadence),
                            border: `1px solid ${getCadenceColor(payment.cadence)}30`,
                          }}
                        />
                        <Tooltip title={`Predicted from ${payment.occurrences} previous transactions (Last on ${payment.lastPaymentDate})`}>
                          <Chip
                            size="small"
                            label={`${payment.confidence} confidence`}
                            variant="outlined"
                            sx={{
                              height: 18,
                              fontSize: '0.62rem',
                              opacity: 0.75,
                            }}
                          />
                        </Tooltip>
                      </Stack>
                    </TableCell>

                    {/* Account */}
                    <TableCell sx={{ py: 1.25 }}>
                      <Stack direction="row" alignItems="center" spacing={0.75}>
                        <AccountBalanceWalletIcon sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.7 }} />
                        <Typography variant="body2" color="text.secondary">
                          {payment.accountName}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* Forecast Amount */}
                    <TableCell align="right" sx={{ py: 1.25 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: isExpense ? '#DC2626' : '#059669',
                        }}
                      >
                        {isExpense ? '-' : '+'}
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── Expand / Collapse Toggle ─────────────────────────────── */}
      {!loading && filteredPredictions.length > 7 && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            size="small"
            variant="text"
            onClick={() => setIsExpanded(!isExpanded)}
            endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              color: 'primary.main',
            }}
          >
            {isExpanded
              ? 'Show fewer payments'
              : `Show all ${filteredPredictions.length} scheduled payments`}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default UpcomingPaymentsWidget;
