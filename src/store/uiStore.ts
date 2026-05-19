import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';
export type ModalType = 'none' | 'imagePreview' | 'moodSelector' | 'chatTheme' | 'mediaGallery' | 'callIncoming' | 'profile';
export type ActiveTab = 'chats' | 'calls' | 'contacts' | 'explore' | 'settings';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface UIStore {
  activeTab: ActiveTab;
  modal: ModalType;
  modalData: unknown;
  toasts: Toast[];
  isMobileMenuOpen: boolean;
  isComposerFocused: boolean;

  setActiveTab: (tab: ActiveTab) => void;
  openModal: (modal: ModalType, data?: unknown) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  setMobileMenu: (open: boolean) => void;
  setComposerFocused: (focused: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: 'chats',
  modal: 'none',
  modalData: null,
  toasts: [],
  isMobileMenuOpen: false,
  isComposerFocused: false,

  setActiveTab: (tab) => set({ activeTab: tab }),

  openModal: (modal, data = null) => set({ modal, modalData: data }),
  closeModal: () => set({ modal: 'none', modalData: null }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, toast.duration || 3000);
  },

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id),
  })),

  setMobileMenu: (open) => set({ isMobileMenuOpen: open }),
  setComposerFocused: (focused) => set({ isComposerFocused: focused }),
}));
