"use client" ;
import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface ErrorViewProps {
    message?: string,
    reFetchKey?: () => void,
}

/**
 * Displays a centered error indicator with an optional message.
 * @param {ErrorViewProps} props Component properties.
 * @param {string} [props.message] Optional error description to surface.
 * @param {() => void} [props.reFetchKey] Optional callback to retry the failed action.
 */
export const ErrorView = ({
    message,
    reFetchKey,
}: ErrorViewProps) => {
    const onRetry = () => {
        // TODO: implement retry logic
    }
    return (
        <div className=" flex justify-center items-center h-full flex-1 flex-col gap-y-4">
            <Card className=" lg:w-lg md:w-md w-full flex flex-col justify-center items-center p-6 gap-y-4">

                <AlertTriangleIcon className="text-primary size-8" />

                {!!message && <p className="text-sm text-muted-foreground">{message}</p>}

                {reFetchKey && <Button onClick={onRetry} ><RotateCcwIcon />  Retry</Button>}
            </Card>
        </div>
    )
}
