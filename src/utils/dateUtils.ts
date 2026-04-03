import { format } from 'date-fns';

export const formatDateTime = (dateTimeStr: string): string => {
  try {
    const date = new Date(dateTimeStr);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateTimeStr;
  }
};
