"use client";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { useMemo } from "react";
import { darkTheme, lightTheme } from "../lib";
import { useUploadImage } from "@/features/image/hooks/use-upload-image-hook";

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
    isEditable?: boolean;
}

export const Editor = ({ value, onChange, isEditable = true }: EditorProps) => {
    const { resolvedTheme } = useTheme();
    const { mutateAsync: uploadImage } = useUploadImage();

    const theme = useMemo(() => {
        return resolvedTheme === "dark" ? darkTheme : lightTheme;
    }, [resolvedTheme]);

    const handleUploadFile = async (file: File): Promise<string> => {
        const result = await uploadImage({ file });
        return result.url;
    }

    const editor = useCreateBlockNote({
        initialContent:
            value
                ? JSON.parse(value) : undefined,
        uploadFile : handleUploadFile
    });

    return (
        <BlockNoteView
            editor={editor}
            editable={isEditable}
            theme={theme}
            onChange={() => {
                onChange(JSON.stringify(editor.document, null, 2));
            }}
            className="min-h-[200px] [&_.bn-container]:max-w-full [&_.bn-editor]:max-w-full [&_.bn-block-content]:break-words [&_.bn-inline-content]:break-words [&_pre]:overflow-x-auto [&_pre]:max-w-full [&_table]:max-w-full [&_table]:overflow-x-auto"

        />
    )
}
