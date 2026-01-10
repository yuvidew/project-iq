import { useEventListener } from "@liveblocks/react";

export function useInviteRealtime(refetch: () => void) {
  useEventListener(({ event }) => {
    if (!event?.type) return;

    if (
      event.type === "invite.created" ||
      event.type === "invite.accepted" ||
      event.type === "invite.bulkAccepted"
    ) {
      refetch(); // pull fresh truth from DB
    }
  });
}
