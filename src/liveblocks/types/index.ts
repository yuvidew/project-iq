export type Notification = {
    id: string;
    type: "INVITE_SENT" | "INVITE_ACCEPTED";
    message: string;
    createdAt: Date;
    read: boolean;
    details?: string;
    inviteToken?: string;
    orgName?: string;
    orgSlug?: string;
};

export type LiveblocksEvent =
    | {
        type: "INVITE_SENT";
        payload: {
            organizationName: string;
            organizationSlug: string;
            invitedByName: string;
            invitedEmail: string;
            role: string;
            token: string;
        };
    }
    | {
        type: "INVITE_ACCEPTED";
        payload: {
            joinedUserName: string;
            organizationName: string;
        };
    };
