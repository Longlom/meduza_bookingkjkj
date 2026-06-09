import { driveThumbnailUrl } from "@/lib/staffPhoto";

const CACHE_SECONDS = 60 * 60;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();

  if (!id || !/^[a-zA-Z0-9_-]+$/.test(id)) {
    return new Response("Invalid file id.", { status: 400 });
  }

  const sourceUrl = driveThumbnailUrl(id, 400);

  let upstream: Response;
  try {
    upstream = await fetch(sourceUrl, {
      redirect: "follow",
      headers: { accept: "image/*" }
    });
  } catch {
    return new Response("Failed to fetch photo.", { status: 502 });
  }

  if (!upstream.ok) {
    return new Response("Photo not found.", { status: upstream.status === 404 ? 404 : 502 });
  }

  const contentType = upstream.headers.get("content-type") || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    return new Response("Photo not available. Check Drive sharing is set to anyone with the link.", {
      status: 502
    });
  }

  const body = upstream.body;
  if (!body) {
    return new Response("Empty photo response.", { status: 502 });
  }

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`
    }
  });
}
