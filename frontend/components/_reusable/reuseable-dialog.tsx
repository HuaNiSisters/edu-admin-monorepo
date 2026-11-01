import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReusableDialogProps extends React.PropsWithChildren {
  title: string;
  isOpen: boolean;
  canCancel?: boolean;
  canClose?: boolean;
  onClose: () => void;
  onCancel: () => void;
  onConfirm: (data: any) => void;
  cancelText?: string;
  confirmText?: string;
  contentClassName?: string;
}

export const ReusableDialog = ({
  title,
  isOpen,
  onClose,
  onConfirm,
  canCancel = true,
  canClose = true,
  onCancel,
  cancelText = "Cancel",
  confirmText = "OK",
  contentClassName,
  children,
}: ReusableDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={canClose} className={contentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {children}

        <DialogFooter>
          {canCancel && (
            <Button variant="outline" onClick={onCancel}>
              {cancelText}
            </Button>
          )}
          <Button onClick={onConfirm} className="btn btn-primary">
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
