import { create } from "zustand";
import { Task } from "../types";

interface TaskDetails {
    open: boolean;
    setOpen: (value: boolean) => void;
    initialState: Partial<Task>;
    setInitialState: (value: Partial<Task>) => void;
};

const defaultInitialState: Partial<Task> = {
    name: "",
    id: "",
};

export const useTaskDetails = create<TaskDetails>((set) => ({
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
