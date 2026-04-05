import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from '@mui/material';
import type { Category } from '../../models/categories';

export interface TransactionCategoryTotalsFilterFormValues {
  month: string;
  year: string;
  categoryId: string;
}

interface TransactionCategoryTotalsFiltersProps {
  control: Control<TransactionCategoryTotalsFilterFormValues>;
  monthOptions: Array<{ value: string | number; label: string }>;
  categories: Category[];
  categoriesLoading: boolean;
  loading: boolean;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onReload: () => void;
}

const TransactionCategoryTotalsFilters: React.FC<TransactionCategoryTotalsFiltersProps> = ({
  control,
  monthOptions,
  categories,
  categoriesLoading,
  loading,
  onMonthChange,
  onYearChange,
  onCategoryChange,
  onReload,
}) => {
  const { t } = useTranslation();

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>{t('transactionCategoryTotals.filters.month')}</InputLabel>
          <Controller
            control={control}
            name="month"
            render={({ field }) => (
              <Select
                {...field}
                label={t('transactionCategoryTotals.filters.month')}
                onChange={(event) => {
                  field.onChange(event);
                  onMonthChange(String(event.target.value));
                }}
              >
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
              onChange={(event) => {
                field.onChange(event);
                onYearChange(event.target.value);
              }}
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
                onChange={(event) => {
                  field.onChange(event);
                  onCategoryChange(String(event.target.value));
                }}
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

        <Button variant="contained" onClick={onReload} disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : t('common.reload')}
        </Button>
      </Box>
    </Paper>
  );
};

export default TransactionCategoryTotalsFilters;
