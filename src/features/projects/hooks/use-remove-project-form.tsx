import { create } from "zustand";
import { Project } from "../types";

interface RemoveProjectDialog {
    open: boolean;
    setOpen: (value: boolean) => void;
    initialState: Partial<Project>;
    setInitialState: (value: Partial<Project>) => void;
    reset: () => void;
};

const defaultInitialState: Partial<Project> = {
    name: "",
    id: "",
};

export const useRemoveProjectDialog = create<RemoveProjectDialog>((set) => ({
    open: false,
    setOpen: (value) => set({ open: value }),
    initialState: defaultInitialState,
    setInitialState: (value) => set({
        initialState: {
            ...defaultInitialState,
            ...value,
        },
    }),
    reset: () => set({
        initialState: defaultInitialState,
        open: false,
    }),
}));