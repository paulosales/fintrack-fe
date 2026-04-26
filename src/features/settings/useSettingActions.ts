import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useConfirmDialog from '../../hooks/useConfirmDialog';
import type { Setting, SettingMutationPayload } from '../../models/settings';
import type { AppDispatch } from '../../store';
import { createSetting, deleteSetting, updateSetting } from './settingsSlice';

export const buildSettingFormDefaults = (setting: Setting | null): SettingMutationPayload => ({
  code: setting?.code ?? '',
  description: setting?.description ?? '',
  value: setting?.value ?? '',
});

const useSettingActions = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<Setting | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    open: confirmOpen,
    payload: confirmPayload,
    openConfirm,
    closeConfirm,
  } = useConfirmDialog<Setting>();

  const closeFeedback = () => {
    setActionError(null);
    setActionMessage(null);
  };

  const handleCreateClick = () => {
    setEditingSetting(null);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleEditClick = (setting: Setting) => {
    setEditingSetting(setting);
    setFormError(null);
    setActionError(null);
    setActionMessage(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setEditingSetting(null);
    setFormError(null);
  };

  const buildPayload = (formValues: SettingMutationPayload): SettingMutationPayload | null => {
    const code = formValues.code.trim();
    const description = formValues.description.trim();
    if (!code || !description) {
      setFormError(t('settings.requiredError'));
      return null;
    }
    setFormError(null);
    return {
      code,
      description,
      value: formValues.value?.trim() || null,
    };
  };

  const handleSubmit = async (formValues: SettingMutationPayload) => {
    const payload = buildPayload(formValues);
    if (!payload) return;

    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);

    try {
      if (editingSetting) {
        await dispatch(updateSetting({ code: editingSetting.code, payload })).unwrap();
        setActionMessage(t('settings.updated'));
      } else {
        await dispatch(createSetting(payload)).unwrap();
        setActionMessage(t('settings.created'));
      }
      setDialogOpen(false);
      setEditingSetting(null);
    } catch (submitError) {
      setActionError(submitError instanceof Error ? submitError.message : String(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (setting: Setting) => {
    openConfirm(setting);
    setActionError(null);
    setActionMessage(null);
  };

  const handleConfirm = async () => {
    if (!confirmPayload) return;
    setIsSubmitting(true);
    setActionError(null);
    setActionMessage(null);
    closeConfirm();

    try {
      await dispatch(deleteSetting(confirmPayload.code)).unwrap();
      setActionMessage(t('settings.deleted'));
    } catch (deleteError) {
      setActionError(deleteError instanceof Error ? deleteError.message : String(deleteError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
  };
};

export default useSettingActions;
