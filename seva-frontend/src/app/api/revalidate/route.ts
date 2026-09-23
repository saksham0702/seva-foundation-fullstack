import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { tag, path, secret } = body;

    // Optional secret check if REVALIDATE_SECRET is configured
    const expectedSecret = process.env.REVALIDATE_SECRET;
    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
    }

    if (tag) {
      try {
        // Next.js 15 support: pass profile or call revalidateTag
        (revalidateTag as any)(tag, "max");
      } catch {
        (revalidateTag as any)(tag);
      }
    }
    if (path) {
      revalidatePath(path);
    }

    return NextResponse.json({
      revalidated: true,
      tag: tag || null,
      path: path || null,
      now: Date.now(),
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Error revalidating", error: err.message }, { status: 500 });
  }
}
