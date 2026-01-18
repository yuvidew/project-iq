import { useEventListener } from "@liveblocks/react";

type InviteEvent = {
  type?: "invite.created" | "invite.accepted" | "invite.bulkAccepted";
};

export function useInviteRealtime(refetch: () => void) {
  useEventListener(({ event }) => {
    if (!event || typeof event !== "object" || event === null) return;

    const typedEvent = event as InviteEvent;
    if (!typedEvent.type) return;

    if (
      typedEvent.type === "invite.created" ||
      typedEvent.type === "invite.accepted" ||
      typedEvent.type === "invite.bulkAccepted"
    ) {
      refetch(); // pull fresh truth from DB
    }
  });
}
