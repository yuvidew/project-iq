import {create} from "zustand";

type DocumentSchemaValue = {
    name: string;
    projectId: string;
    document: string;
    id? : string;
}

interface CreateDocument {
    open: boolean;
    setOpen: (value: boolean) => void;

    document : DocumentSchemaValue,
    setDocument : (value : DocumentSchemaValue) => void;

    isUpdate : boolean;
    setIsUpdate : (value : boolean) => void;
};

export const useCreateDocumentDialog = create<CreateDocument>((set) => ({
    open: false,
    setOpen: (value) => set({ open: value }),


    document: {
        name: "Untitled Document",
        projectId: "",
        document: "",
    },
    setDocument: (value) => set({
        document: {
            ...value,
        },
    }),


    isUpdate: false,
    setIsUpdate: (value) => set({ isUpdate: value }),
}));