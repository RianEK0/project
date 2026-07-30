import { create } from 'zustand';

type UiState = {
  isSidebarCompact: boolean;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  isSidebarCompact: false,
  toggleSidebar: () =>
    set((state) => ({
      isSidebarCompact: !state.isSidebarCompact,
    })),
}));

