import { useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import type { SubTransaction } from './types';
import type { SubTransactionFormValues } from './SubTransactionFormDialog';
import {
  fetchSubTransactions,
  updateSubTransaction,
  createSubTransaction,
} from './transactionSlice';

const useSubTransactionActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [editingSub, setEditingSub] = useState<SubTransaction | null>(null);
  const [creatingSubFor, setCreatingSubFor] = useState<number | null>(null);

  const subDialogOpen = Boolean(editingSub) || Boolean(creatingSubFor);

  const toggleExpand = (transactionId: number) => {
    const isExpanded = expandedIds.includes(transactionId);
    if (isExpanded) {
      setExpandedIds(expandedIds.filter((id) => id !== transactionId));
    } else {
      setExpandedIds([...expandedIds, transactionId]);
      void dispatch(fetchSubTransactions(transactionId));
    }
  };

  const handleEditSub = (subTransaction: SubTransaction) => setEditingSub(subTransaction);

  const handleOpenCreateSub = (transactionId: number) => setCreatingSubFor(transactionId);

  const handleCloseSubDialog = () => {
    setEditingSub(null);
    setCreatingSubFor(null);
  };

  const handleSaveSub = async (values: SubTransaction) => {
    try {
      await dispatch(
        updateSubTransaction({
          id: values.id,
          transactionId: values.transactionId,
          payload: {
            productCode: values.productCode,
            amount: Number(values.amount),
            description: values.description,
            note: values.note,
            categoryIds: values.categoryIds
              ? values.categoryIds.split(',').map(Number).filter((v) => !Number.isNaN(v))
              : [],
          },
        })
      ).unwrap();
      setEditingSub(null);
      void dispatch(fetchSubTransactions(values.transactionId));
    } catch {
      // noop
    }
  };

  const handleCreateSub = async (values: SubTransactionFormValues) => {
    if (!creatingSubFor) return;
    try {
      const payload = {
        productCode: values.productCode || null,
        amount: Number(values.amount || 0),
        description: values.description || '',
        note: values.note || null,
        categoryIds: values.categoryIds
          ? values.categoryIds.map(Number).filter((v) => !Number.isNaN(v))
          : [],
      };
      await dispatch(createSubTransaction({ transactionId: creatingSubFor, payload })).unwrap();
      void dispatch(fetchSubTransactions(creatingSubFor));
      setCreatingSubFor(null);
    } catch {
      // ignore for now
    }
  };

  return {
    expandedIds,
    editingSub,
    creatingSubFor,
    subDialogOpen,
    toggleExpand,
    handleEditSub,
    handleOpenCreateSub,
    handleCloseSubDialog,
    handleSaveSub,
    handleCreateSub,
  };
};

export default useSubTransactionActions;
