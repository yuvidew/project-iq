import { create } from 'zustand';

interface AllTaskDialog {
    open: boolean;
    setOpen : (value: boolean) => void;
};

export const useAllTasksDialog = create<AllTaskDialog>((set) => ({
    open: false,
    setOpen : (value) => set({open : value})
}))