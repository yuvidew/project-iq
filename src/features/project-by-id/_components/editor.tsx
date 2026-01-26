"use client";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import {  useMemo } from "react";
import { darkTheme, lightTheme } from "../lib";

interface EditorProps {
    value : string;
    onChange : (value : string) => void;
    isEditable?: boolean;
}

export const Editor = ({ value, onChange, isEditable = true }: EditorProps) => {
    const { resolvedTheme } = useTheme();

    const theme = useMemo(() => {
        return resolvedTheme === "dark" ? darkTheme : lightTheme;
    }, [resolvedTheme]);

    const editor = useCreateBlockNote({
        initialContent:
            value
                ? JSON.parse(value) : undefined,
    });

    return (
        <section >
            <BlockNoteView
                editor={editor}
                editable={isEditable}
                theme={theme}
                onChange={() => {
                    onChange(JSON.stringify(editor.document, null, 2));
                }}
            />
        </section>
    )
}
