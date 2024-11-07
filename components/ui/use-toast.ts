import { Toast } from "@/components/ui/toast"
import { useToast as useToastOriginal } from "@/components/ui/toast"

type ToastProps = React.ComponentProps<typeof Toast>

interface ExtendedToastProps extends ToastProps {
  description?: string;
}

export function useToast() {
  const { toast: originalToast, ...rest } = useToastOriginal()

  const toast = (props: ExtendedToastProps) => {
    const { description, ...restProps } = props;
    originalToast({
      ...restProps,
      // Use description in the content property if it exists
      ...(description && { content: description }),
    })
  }

  return { toast, ...rest }
}