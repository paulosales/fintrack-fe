import React from 'react';
import { Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Box, Button, CircularProgress, Paper, TextField, Autocomplete } from '@mui/material';
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
        <Controller
          control={control}
          name="month"
          render={({ field }) => {
            const value = field.value
              ? monthOptions.find((m) => String(m.value) === String(field.value))
              : null;

            return (
              <Autocomplete
                options={monthOptions}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(opt, val) => String(opt.value) === String(val?.value)}
                value={value}
                onChange={(_, newVal) => {
                  field.onChange(newVal ? String(newVal.value) : '');
                  onMonthChange(newVal ? String(newVal.value) : '');
                }}
                sx={{ minWidth: 220 }}
                renderInput={(params) => (
                  <TextField {...params} label={t('transactionCategoryTotals.filters.month')} />
                )}
              />
            );
          }}
        />

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

        <Controller
          control={control}
          name="categoryId"
          render={({ field }) => {
            const value = field.value ? categories.find((c) => c.id === Number(field.value)) : null;

            return (
              <Autocomplete
                options={categories}
                getOptionLabel={(option) => option.name}
                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                value={value}
                onChange={(_, newVal) => {
                  field.onChange(newVal ? String(newVal.id) : '');
                  onCategoryChange(newVal ? String(newVal.id) : '');
                }}
                disabled={categoriesLoading}
                sx={{ minWidth: 260 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('transactionCategoryTotals.filters.category')}
                    placeholder={t('common.allCategories')}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {categoriesLoading ? (
                            <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
                          ) : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            );
          }}
        />

        <Button variant="contained" onClick={onReload} disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : t('common.reload')}
        </Button>
      </Box>
    </Paper>
  );
};

export default TransactionCategoryTotalsFilters;
