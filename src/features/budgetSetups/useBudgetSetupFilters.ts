import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { fetchBudgetSetups } from './budgetSetupSlice';

function useBudgetSetupFilters() {
  const dispatch = useDispatch<AppDispatch>();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  useEffect(() => {
    dispatch(fetchBudgetSetups({ page, pageSize }));
  }, [dispatch, page, pageSize]);

  const reloadBudgetSetups = (nextPage = page) => {
    dispatch(fetchBudgetSetups({ page: nextPage, pageSize }));
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  return {
    page,
    setPage,
    reloadBudgetSetups,
    handlePageSizeChange,
  };
}

export default useBudgetSetupFilters;
