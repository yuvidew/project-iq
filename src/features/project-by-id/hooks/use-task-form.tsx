import { create } from "zustand";

type TaskFrom = {
    open: boolean;
    setOpen: (value: boolean) => void;
    initialState?: {
        name: string,
        description: string,
        status: string,//TODO: change to native enum
        priority: string,//TODO: change to native enum
        assignee: string,
        type: string,//TODO: change to native enum
        due_date: Date | null,
    }
};

export const useTaskForm = create<TaskFrom>((set) => ({
    open: false,
    setOpen: (value) => set({
        open: value
    }),
    initialState: {
        name: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assignee: "",
        type: "TASK",
        due_date: null,
    },
})) 