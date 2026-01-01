import { create } from "zustand";
import { Task } from "../types";

interface RemoveTaskDialog {
    open: boolean;
    setOpen: (value: boolean) => void;
    initialState: Partial<Task>;
    setInitialState: (value: Partial<Task>) => void;
};

const defaultInitialState: Partial<Task> = {
    name: "",
    id: "",
};

export const useRemoveTaskDialog = create<RemoveTaskDialog>((set) => ({
    open: false,
    setOpen: (value) => set({ open: value }),
    initialState: defaultInitialState,
    setInitialState: (value) => set({
        initialState: {
            ...defaultInitialState,
            ...value,
        },
    }),
}));
