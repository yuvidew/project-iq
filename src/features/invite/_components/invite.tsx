"use client"

import { ErrorView } from "@/components/error-view";
import { LoadingView } from "@/components/loading-view";
import { Button } from "@/components/ui/button";
import { FolderOpenIcon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useAcceptInvitation, useDeclineInvitation } from "../hooks/use-invite";
import { Spinner } from "@/components/ui/spinner";


export const InviteErrorView = () => {
    return <ErrorView message='Error loading Invited organization' />
};

export const InviteLoadingView = () => {
    return <LoadingView message='Loading Invited organization...' />
};




export const InviteView = () => {
    const searchParams = useSearchParams();
    const organization = searchParams.get("organization");
    const notificationDetails = searchParams.get("details");
    const {token} = useParams<{token : string}>()

    const {mutate: onAccept, isPending: isAcceptPending} = useAcceptInvitation();

    const {mutate: onDecline, isPending: isDeclinePending} = useDeclineInvitation();
    
    return (
        <main className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <section className="w-full max-w-sm flex flex-col gap-6">
                <div className="flex flex-col items-center gap-6 text-center">
                    {/* Icon */}
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <FolderOpenIcon className="h-8 w-8 text-primary" />
                    </div>
                    
                    {/* Heading */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            You've been invited!
                        </h1>
                        <p className="text-muted-foreground">
                            You've been invited to join{" "}
                            <span className="font-medium text-foreground">
                                {organization || "an organization"}
                            </span>
                        </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">
                        Accept this invitation to collaborate with your team and access shared resources.
                    </p>

                    {notificationDetails && (
                        <p className="text-sm text-muted-foreground">
                            {notificationDetails}
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex w-full flex-col gap-3">
                        <Button 
                            disabled = {isAcceptPending}
                            className="w-full" 
                            size="lg"
                            onClick={() => onAccept({token})}
                        >
                            {isAcceptPending? (
                                <>
                                    <Spinner/>

                                    Accepting...
                                </>
                            ) : "Accept invitation"}
                        </Button>
                        <Button 
                            disabled = {isDeclinePending}
                            variant="outline" 
                            className="w-full" 
                            size="lg"
                            onClick={() => onDecline({token})}
                        >
                            {isDeclinePending? (
                                <>
                                    <Spinner/>

                                    Declining...
                                </>
                            ) : "Decline"}
                        </Button>
                    </div>
                </div>
            </section>
        </main>
    );
};
