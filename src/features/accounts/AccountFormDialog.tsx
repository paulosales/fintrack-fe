import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Autocomplete,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { Account, AccountMutationPayload } from '../../models/accounts';
import type { AccountType } from '../../models/accountTypes';
import type { Currency } from '../../models/currencies';

interface AccountFormDialogProps {
  open: boolean;
  editingAccount: Account | null;
  initialValues: AccountMutationPayload;
  accountTypes: AccountType[];
  accountTypesLoading: boolean;
  currencies: Currency[];
  currenciesLoading: boolean;
  formError: string | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: AccountMutationPayload) => void;
}

const AccountFormDialog: React.FC<AccountFormDialogProps> = ({
  open,
  editingAccount,
  initialValues,
  accountTypes,
  accountTypesLoading,
  currencies,
  currenciesLoading,
  formError,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();
  const { control, handleSubmit, reset } = useForm<AccountMutationPayload>({
    defaultValues: initialValues,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues);
    }
  }, [initialValues, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{editingAccount ? t('accounts.edit') : t('accounts.create')}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="account-form"
          spacing={2}
          sx={{ mt: 1 }}
          onSubmit={handleSubmit(onSubmit)}
        >
          {formError && <Alert severity="error">{formError}</Alert>}
          <Controller
            control={control}
            name="code"
            render={({ field }) => (
              <TextField {...field} label={t('accounts.form.code')} required fullWidth autoFocus />
            )}
          />
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <TextField {...field} label={t('accounts.form.name')} required fullWidth />
            )}
          />
          <Controller
            control={control}
            name="accountTypeId"
            render={({ field }) => (
              <TextField
                {...field}
                select
                label={t('accounts.form.accountType')}
                required
                fullWidth
                disabled={accountTypesLoading}
                InputProps={
                  accountTypesLoading ? { endAdornment: <CircularProgress size={20} /> } : {}
                }
              >
                {accountTypes.map((at) => (
                  <MenuItem key={at.id} value={at.id}>
                    {at.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <Autocomplete
                options={currencies}
                loading={currenciesLoading}
                getOptionLabel={(opt) =>
                  typeof opt === 'string' ? opt : `${opt.code} — ${opt.name}`
                }
                value={currencies.find((c) => c.code === field.value) ?? null}
                onChange={(_, newValue) => {
                  field.onChange(newValue ? newValue.code : '');
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('accounts.form.currency')}
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {currenciesLoading ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" form="account-form" variant="contained" disabled={isSubmitting}>
          {editingAccount ? t('common.saveChanges') : t('accounts.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountFormDialog;
