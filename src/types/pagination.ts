export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export const defaultPagination: PaginationMeta = {
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
};
