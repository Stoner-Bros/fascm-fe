import { toast } from 'sonner';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  className?: string;
}

export const useToast = () => {
  const showToast = ({
    title,
    description,
    variant = 'default',
    className
  }: ToastProps) => {
    if (variant === 'destructive') {
      toast.error(title || 'Error', {
        description,
        className
      });
    } else {
      toast.success(title || 'Success', {
        description,
        className
      });
    }
  };

  return {
    toast: showToast
  };
};
