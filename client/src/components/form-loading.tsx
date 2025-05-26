import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FormLoadingProps {
  text?: string;
}

export function FormLoading({ text = "Bezig met verwerken..." }: FormLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function LoadingButton({
  loading = false,
  loadingText = "Bezig...",
  children,
  disabled,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
} 