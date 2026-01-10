import { NextResponse } from "next/server";
import { liveblocks } from "@/server/liveblocks";
import { getServerSession } from "next-auth"; // adjust if not next-auth
import { authOptions } from "@/server/auth"; // adjust path

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { room } = await req.json(); // Liveblocks client sends room id

  const { body, status } = await liveblocks.identifyUser(
    {
      userId: session.user.id,
      groupIds: [], // optional
    },
    {
      userInfo: {
        name: session.user.name ?? "",
        email: session.user.email ?? "",
      },
    }
  );

  return new NextResponse(body, { status });
}
