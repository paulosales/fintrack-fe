import { useState } from 'react';

export interface ConfirmDialogState<T> {
  open: boolean;
  payload: T | null;
  openConfirm: (payload: T) => void;
  closeConfirm: () => void;
}

function useConfirmDialog<T>(): ConfirmDialogState<T> {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<T | null>(null);

  const openConfirm = (nextPayload: T) => {
    setPayload(nextPayload);
    setOpen(true);
  };

  const closeConfirm = () => {
    setOpen(false);
    setPayload(null);
  };

  return { open, payload, openConfirm, closeConfirm };
}

export default useConfirmDialog;
