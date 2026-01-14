export type Notification = {
    id: string;
    type: "INVITE_SENT" | "INVITE_ACCEPTED";
    message: string;
    createdAt: Date;
    read: boolean;
    details?: string;
};

export type LiveblocksEvent =
    | {
        type: "INVITE_SENT";
        payload: {
            organizationName: string;
            invitedByName: string;
            invitedEmail: string;
            role: string;
        };
    }
    | {
        type: "INVITE_ACCEPTED";
        payload: {
            joinedUserName: string;
            organizationName: string;
        };
    };
