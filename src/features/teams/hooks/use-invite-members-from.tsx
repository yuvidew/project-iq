import { create } from "zustand";

interface InviteMembersForm {
    open: boolean;
    setOpen: (value: boolean) => void;
};



export const useInviteMembersForm = create<InviteMembersForm>((set) => ({
    open: false,
    setOpen: (value) => set({ open: value }),
}));