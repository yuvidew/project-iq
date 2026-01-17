import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json(
    notifications.map((notification) => {
      const notificationData = notification.data as {
        message?: string;
        details?: string;
        organizationName?: string;
        organizationSlug?: string;
        slug?: string;
        token?: string;
      };

      const dataWithSlug = {
        ...notificationData,
        organizationSlug: notificationData.organizationSlug ?? notificationData.slug,
      };

        return {
          id: notification.id,
          type: notification.type,
          data: dataWithSlug,
          read: notification.read,
          createdAt: notification.createdAt.toISOString(),
        };
    })
  );
}
