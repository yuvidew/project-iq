import { NextResponse } from "next/server";
import { liveblocks } from "@/server/liveblocks";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { room } = await req.json(); // Liveblocks client sends room id

  const liveblocksSession = liveblocks.prepareSession(session.user.id, {
    userInfo: {
      name: session.user.name ?? "",
      email: session.user.email ?? "",
    },
  });

  liveblocksSession.allow(room, liveblocksSession.FULL_ACCESS);

  const { body, status } = await liveblocksSession.authorize();

  return new NextResponse(body, { status });
}
