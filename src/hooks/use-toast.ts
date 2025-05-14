
import { toast as sonnerToast } from "sonner";

// Define the toast parameters in a type
type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
};

// Create a use-toast hook for easily calling toast functions
export const useToast = () => {
  const toast = ({ title, description, action, variant = "default" }: ToastProps) => {
    sonnerToast(title, {
      description,
      action,
      className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : ""
    });
  };

  return { toast };
};

// Export the toast function directly for use outside of components
export const toast = ({ title, description, action, variant = "default" }: ToastProps) => {
  sonnerToast(title, {
    description,
    action,
    className: variant === "destructive" ? "bg-destructive text-destructive-foreground" : ""
  });
};
