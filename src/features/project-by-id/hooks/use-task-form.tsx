import { create } from "zustand";
import { Task } from "../types";

type TaskForm = {
    open: boolean;
    setOpen: (value: boolean) => void;
    initialState: Partial<Task>;
    setInitialState: (value: Partial<Task>) => void;
    reset: () => void;
};

const defaultInitialState: Partial<Task> = {
    name: "",
    description: "",
    status: "TODO",
    dueDate: null,
    assigneeId: "",
    position: 0,
};

export const useTaskForm = create<TaskForm>((set) => ({
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
