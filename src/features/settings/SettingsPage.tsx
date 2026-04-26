import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import ConfirmDialog from '../../components/ConfirmDialog';
import FeedbackSnackbar from '../../components/FeedbackSnackbar';
import type { AppDispatch, RootState } from '../../store';
import { fetchSettings } from './settingsSlice';
import SettingFormDialog from './SettingFormDialog';
import SettingTable from './SettingTable';
import useSettingActions, { buildSettingFormDefaults } from './useSettingActions';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.settings);

  const {
    dialogOpen,
    editingSetting,
    formError,
    isSubmitting,
    actionError,
    actionMessage,
    closeFeedback,
    confirmOpen,
    confirmPayload,
    closeConfirm,
    handleCreateClick,
    handleEditClick,
    handleDialogClose,
    handleSubmit,
    handleDeleteClick,
    handleConfirm,
  } = useSettingActions();

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

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
          {t('settings.title')}
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
          {t('settings.create')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('settings.failedLoadSettings', { error })}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && !error && data.length === 0 && (
        <Alert severity="info">{t('settings.empty')}</Alert>
      )}

      {!loading && data.length > 0 && (
        <SettingTable settings={data} onEdit={handleEditClick} onDelete={handleDeleteClick} />
      )}

      <SettingFormDialog
        open={dialogOpen}
        editingSetting={editingSetting}
        initialValues={buildSettingFormDefaults(editingSetting)}
        formError={formError}
        isSubmitting={isSubmitting}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={t('settings.deleteConfirm', { code: confirmPayload?.code ?? '' })}
        content={t('settings.deleteConfirm', { code: confirmPayload?.code ?? '' })}
        confirmText={t('common.delete')}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
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

export default SettingsPage;
