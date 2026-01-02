import { create } from "zustand";
import { Project } from "../types";
import { ProjectPriority, ProjectStatus } from "@/generated/prisma";

interface ProjectForm {
    open: boolean;
    setOpen: (value: boolean) => void;
    initialState: Partial<Project>;
    setInitialState: (value: Partial<Project>) => void;
    reset: () => void;
};

const defaultInitialState: Partial<Project> = {
    name: "",
    description: "",
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.MEDIUM,
    startDate: undefined,
    endDate: undefined,
    members: [],
    projectLeadEmail: "No lead"
};

export const useProjectForm = create<ProjectForm>((set) => ({
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