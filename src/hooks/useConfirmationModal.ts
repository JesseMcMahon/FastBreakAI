import { useState } from "react";

interface ConfirmationModalState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  isLoading: boolean;
  variant: "default" | "destructive";
}

export function useConfirmationModal() {
  const [modal, setModal] = useState<ConfirmationModalState>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: () => {},
    isLoading: false,
    variant: "default",
  });

  const showModal = (config: Omit<ConfirmationModalState, "isOpen">) => {
    setModal({
      ...config,
      isOpen: true,
    });
  };

  const hideModal = () => {
    if (modal.isLoading) return;
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const setLoading = (isLoading: boolean) => {
    setModal((prev) => ({ ...prev, isLoading }));
  };

  return {
    modal,
    showModal,
    hideModal,
    setLoading,
  };
}
