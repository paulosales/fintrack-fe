import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  content?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  content,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onCancel,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={onCancel} aria-label="confirm-dialog">
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        {typeof content === 'string' ? <Typography>{content}</Typography> : content}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
