import { Card } from "./ui/card"
import { Spinner } from "./ui/spinner"


interface LoadingViewProps{
    message?: string,
}

/**
 * Displays a centered spinner with an optional loading message.
 * @param {LoadingViewProps} props Component properties.
 * @param {string} [props.message] Optional loading message.
 */
export const LoadingView = ({
    message,
} : LoadingViewProps)=> {
    return (
        <div className=" flex justify-center items-center h-screen flex-1 flex-col gap-y-4">
            <Card className=" lg:w-lg md:w-md w-[80%] bg-sidebar flex flex-col justify-center items-center p-6 gap-y-4">
                <Spinner className="text-primary size-6" />

                {!!message && <p className="text-sm text-muted-foreground">{message}</p>}
            </Card>
        </div>
    )
}
