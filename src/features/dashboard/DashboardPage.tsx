import React from 'react';
import { Alert, Box, CircularProgress, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { fetchTransactionCategoryTotalDetails, fetchTransactionCategoryTotals } from '../transactionCategoryTotals/transactionCategoryTotalsSlice';
import type { TransactionCategoryTotal, TransactionCategoryTotalDetailRequest } from '../transactionCategoryTotals/types';
import { getTransactionCategoryDetailKey } from '../transactionCategoryTotals/types';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDateTime } from '../../utils/dateUtils';

interface SliceDatum {
  categoryId: number;
  category: string;
  amount: number;
  rawAmount: number;
}

interface PieMonth {
  key: string;
  year: number;
  month: number;
  monthLabel: string;
  totalAmount: number;
  slices: SliceDatum[];
}

interface PieMonthAccumulator {
  key: string;
  year: number;
  month: number;
  monthLabel: string;
  totalAmount: number;
  slicesByCategory: Record<number, SliceDatum>;
}

const PIE_COLORS = [
  '#C0392B',
  '#E67E22',
  '#16A085',
  '#2E86C1',
  '#7D3C98',
  '#566573',
  '#B9770E',
  '#117864',
];

const createMonthLabel = (year: number, month: number): string =>
  new Date(year, month - 1, 1).toLocaleString(undefined, {
    month: 'long',
    year: 'numeric',
  });

const getRecentMonths = (count: number): Array<{ year: number; month: number }> => {
  const months: Array<{ year: number; month: number }> = [];
  const baseDate = new Date();

  for (let index = 0; index < count; index += 1) {
    const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - index, 1);
    months.push({ year: date.getFullYear(), month: date.getMonth() + 1 });
  }

  return months;
};

const buildLastMonths = (rows: TransactionCategoryTotal[], count: number): PieMonth[] => {
  const monthMap = new Map<string, PieMonthAccumulator>();
  const requestedMonths = getRecentMonths(count);

  for (const month of requestedMonths) {
    const monthKey = `${month.year}-${month.month}`;
    monthMap.set(monthKey, {
      key: monthKey,
      year: month.year,
      month: month.month,
      monthLabel: createMonthLabel(month.year, month.month),
      totalAmount: 0,
      slicesByCategory: {},
    });
  }

  for (const row of rows) {
    if (row.totalAmount >= 0) continue;

    const monthKey = `${row.year}-${row.month}`;
    const existing = monthMap.get(monthKey);
    const amount = Math.abs(row.totalAmount);

    if (!existing) {
      continue;
    }

    existing.totalAmount += amount;
    const existingSlice = existing.slicesByCategory[row.categoryId];
    if (existingSlice) {
      existingSlice.amount += amount;
      existingSlice.rawAmount += row.totalAmount;
    } else {
      existing.slicesByCategory[row.categoryId] = {
        categoryId: row.categoryId,
        category: row.category,
        amount,
        rawAmount: row.totalAmount,
      };
    }
  }

  const orderedMonths = Array.from(monthMap.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return orderedMonths.slice(0, count).map((month) => ({
    ...month,
    slices: Object.values(month.slicesByCategory).sort((a, b) => b.amount - a.amount),
  }));
};

const polarToCartesian = (cx: number, cy: number, radius: number, angleDegrees: number) => {
  const angleRadians = (angleDegrees - 90) * (Math.PI / 180);
  return {
    x: cx + radius * Math.cos(angleRadians),
    y: cy + radius * Math.sin(angleRadians),
  };
};

const describeArc = (
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
};

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { detailsByKey } = useSelector((state: RootState) => state.transactionCategoryTotals);
  const [totalsData, setTotalsData] = React.useState<TransactionCategoryTotal[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [activeSlice, setActiveSlice] = React.useState<{
    monthLabel: string;
    request: TransactionCategoryTotalDetailRequest;
    categoryName: string;
  } | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadTotals = async () => {
      setLoading(true);
      setError(null);

      const months = getRecentMonths(6);
      const responses = await Promise.all(
        months.map((month) =>
          dispatch(
            fetchTransactionCategoryTotals({
              month: month.month,
              year: month.year,
              categoryId: null,
              page: 1,
              pageSize: 500,
            })
          )
        )
      );

      if (cancelled) {
        return;
      }

      const failedAction = responses.find((action) =>
        fetchTransactionCategoryTotals.rejected.match(action)
      );

      if (failedAction && fetchTransactionCategoryTotals.rejected.match(failedAction)) {
        const payload = failedAction.payload as string | undefined;
        setError(payload || failedAction.error.message || 'API call failed');
        setTotalsData([]);
        setLoading(false);
        return;
      }

      const mergedRows = responses
        .filter((action): action is ReturnType<typeof fetchTransactionCategoryTotals.fulfilled> =>
          fetchTransactionCategoryTotals.fulfilled.match(action)
        )
        .flatMap((action) => action.payload.data || []);

      setTotalsData(mergedRows);
      setLoading(false);
    };

    void loadTotals();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const pieMonths = React.useMemo(() => buildLastMonths(totalsData, 6), [totalsData]);

  const handleSliceHover = React.useCallback(
    (monthLabel: string, slice: SliceDatum, year: number, month: number) => {
      const request = {
        year,
        month,
        categoryId: slice.categoryId,
      };

      setActiveSlice({
        monthLabel,
        request,
        categoryName: slice.category,
      });

      dispatch(fetchTransactionCategoryTotalDetails(request));
    },
    [dispatch]
  );

  const activeKey = activeSlice ? getTransactionCategoryDetailKey(activeSlice.request) : null;
  const activeDetailsState = activeKey ? detailsByKey[activeKey] : null;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Expense by category for the last 6 months.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load dashboard data: {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && pieMonths.length === 0 && (
        <Alert severity="info">No expense data found for the latest months.</Alert>
      )}

      {pieMonths.length > 0 && (
        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2} alignItems="stretch">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            useFlexGap
            flexWrap="wrap"
            sx={{ flex: 2 }}
          >
            {pieMonths.map((month) => {
              let startAngle = 0;

              return (
                <Paper key={month.key} sx={{ p: 2, minWidth: 320, flex: '1 1 320px' }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {month.monthLabel}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1.5 }}>
                    Total expenses: {formatCurrency(-month.totalAmount)}
                  </Typography>
                  <svg width="280" height="280" viewBox="0 0 240 240" role="img" aria-label={`Pie chart for ${month.monthLabel}`}>
                    {month.slices.map((slice, index) => {
                      const sweep = (slice.amount / month.totalAmount) * 360;
                      const path = describeArc(120, 120, 90, startAngle, startAngle + sweep);
                      startAngle += sweep;

                      return (
                        <path
                          key={`${month.key}-${slice.categoryId}`}
                          d={path}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                          stroke="#ffffff"
                          strokeWidth={2}
                          onMouseEnter={() =>
                            handleSliceHover(month.monthLabel, slice, month.year, month.month)
                          }
                        >
                          <title>
                            {slice.category}: {formatCurrency(slice.rawAmount)}
                          </title>
                        </path>
                      );
                    })}
                    <circle cx="120" cy="120" r="52" fill="#ffffff" />
                  </svg>

                  <Box sx={{ mt: 1, display: 'grid', gap: 0.5 }}>
                    {month.slices.map((slice, index) => (
                      <Box
                        key={`legend-${month.key}-${slice.categoryId}`}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'default' }}
                        onMouseEnter={() =>
                          handleSliceHover(month.monthLabel, slice, month.year, month.month)
                        }
                      >
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: 0.5,
                            bgcolor: PIE_COLORS[index % PIE_COLORS.length],
                          }}
                        />
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {slice.category}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {formatCurrency(slice.rawAmount)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              );
            })}
          </Stack>

          <Paper sx={{ p: 2, flex: 1, minWidth: { xs: '100%', xl: 360 }, maxHeight: '1285px', overflowY: 'scroll', alignSelf: 'stretch' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              {activeSlice
                ? `${activeSlice.monthLabel} · ${activeSlice.categoryName}`
                : 'Hover a category slice'}
            </Typography>

            {!activeSlice && (
              <Typography variant="body2" color="text.secondary">
                Move over any pie slice to see the transactions for that category and month.
              </Typography>
            )}

            {activeSlice && activeDetailsState?.loading && <CircularProgress size={24} />}

            {activeSlice && activeDetailsState?.error && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {activeDetailsState.error}
              </Alert>
            )}

            {activeSlice && !activeDetailsState?.loading && !activeDetailsState?.error && (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(activeDetailsState?.data || []).map((item) => (
                    <TableRow
                      key={`${item.type}-${item.id}-${item.datetime}-${item.amount}-${item.description}`}
                    >
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{formatDateTime(item.datetime)}</TableCell>
                      <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                  ))}
                  {activeDetailsState?.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>No transactions found for this category.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Stack>
      )}
    </Box>
  );
};

export default DashboardPage;
