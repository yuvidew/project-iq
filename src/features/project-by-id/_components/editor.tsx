"use client";

import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { useState } from "react";

export const Editor = () => {
    const [value, setValue] = useState<string>("")
    const { resolvedTheme } = useTheme();


    const editor = useCreateBlockNote({
        initialContent:
            value
                ? JSON.parse(value) : undefined,
    });

    return (
        <section className="">
                <BlockNoteView
                    editor={editor}
                    editable={true}
                    theme={resolvedTheme === "dark" ? "dark" : "light"}
                    onChange={() => {
                        setValue(JSON.stringify(editor.document, null, 2));
                    }}
                />
        </section>
    )
}
