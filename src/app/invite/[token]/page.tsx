import { requireAuth } from "@/lib/auth-utils";

interface Props {
    params: Promise<{
        token: string
    }>,
}

const InvitePage = async ({ params }: Props) => {
    await requireAuth();
    return (
        <div>InvitePage</div>
    )
};

export default InvitePage;
