import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import type { AppDispatch, RootState } from '../../store';
import { importTransactions, resetImport, IMPORTER_TYPES, type ImporterType } from './importSlice';

interface ImportDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (queuedCount: number) => void;
  onError?: (message: string) => void;
}

const IMPORTER_OPTIONS = IMPORTER_TYPES.map((t) => ({ label: t, value: t }));

const ImportDialog: React.FC<ImportDialogProps> = ({ open, onClose, onSuccess, onError }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, importId, queuedCount } = useSelector((state: RootState) => state.import);

  const [importerType, setImporterType] = useState<ImporterType | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset Redux import state every time the dialog opens, regardless of whether
  // the component remounted (exit animation may still be running when reopened)
  useEffect(() => {
    if (open) {
      dispatch(resetImport());
    }
  }, [open, dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] ?? null);
    setValidationError(null);
  };

  const handleSubmit = () => {
    if (!importerType) {
      setValidationError(t('import.noImporter'));
      return;
    }
    if (!file) {
      setValidationError(t('import.noFile'));
      return;
    }
    setValidationError(null);
    dispatch(importTransactions({ importerType, file }));
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const isSuccess = Boolean(importId);
  const calledSuccessRef = useRef(false);
  const calledErrorRef = useRef(false);

  useEffect(() => {
    if (isSuccess && onSuccess && !calledSuccessRef.current) {
      calledSuccessRef.current = true;
      onSuccess(queuedCount ?? 0);
    }
    if (!isSuccess) {
      calledSuccessRef.current = false;
    }
  }, [isSuccess, onSuccess, queuedCount]);

  useEffect(() => {
    if (error && onError && !calledErrorRef.current) {
      calledErrorRef.current = true;
      onError(error);
      onClose();
    }
    if (!error) {
      calledErrorRef.current = false;
    }
  }, [error, onError, onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        transition: {
          onExited: () => {
            setImporterType(null);
            setFile(null);
            setValidationError(null);
          },
        },
      }}
    >
      <DialogTitle>{t('import.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {(validationError || error) && (
            <Alert severity="error">{validationError || t('import.error', { error })}</Alert>
          )}

          {isSuccess && (
            <Alert severity="success">{t('import.success', { count: queuedCount })}</Alert>
          )}

          <Autocomplete
            options={IMPORTER_OPTIONS}
            getOptionLabel={(opt) => opt.label}
            isOptionEqualToValue={(opt, val) => opt.value === val.value}
            value={importerType ? { label: importerType, value: importerType } : null}
            onChange={(_, newVal) => {
              setImporterType((newVal?.value as ImporterType) ?? null);
              setValidationError(null);
            }}
            disabled={loading || isSuccess}
            renderInput={(params) => (
              <TextField {...params} label={t('import.selectImporter')} required fullWidth />
            )}
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isSuccess}
            >
              {t('import.selectFile')}
            </Button>
            {file && (
              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {file.name}
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || isSuccess}
          startIcon={loading ? <CircularProgress size={16} /> : undefined}
        >
          {t('import.submit')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportDialog;
