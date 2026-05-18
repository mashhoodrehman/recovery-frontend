import toast from 'react-hot-toast';

export function extractApiError(err) {
  if (!err) return 'Something went wrong';
  if (err.response?.data?.message) return err.response.data.message;
  if (err.message) return err.message;
  return 'Something went wrong';
}

export function toastApiError(err, fallback = 'Request failed') {
  toast.error(extractApiError(err) || fallback);
}
