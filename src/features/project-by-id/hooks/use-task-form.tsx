import { create } from "zustand";
import { Task } from "../types";

type TaskFrom = {
    open: boolean;
    setOpen: (value: boolean) => void;
    initialState?: Task
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
        dueDate: null,
        assigneeId : "",
        position : 0
    },
})) 