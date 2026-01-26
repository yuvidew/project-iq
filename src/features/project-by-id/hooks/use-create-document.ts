import {create} from "zustand";

type DocumentSchemaValue = {
    document: string;
    id? : string;
    isEdit: boolean;
    name: string;
    projectId: string;
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
        isEdit: true,
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