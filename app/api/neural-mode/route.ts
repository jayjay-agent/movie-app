import { NextResponse } from "next/server";

import { getServerAdminClient, indexName } from "@/lib/algolia";

type Body = { mode?: "keywordSearch" | "neuralSearch" };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (body.mode !== "keywordSearch" && body.mode !== "neuralSearch") {
    return NextResponse.json(
      { error: "Body must include mode: 'keywordSearch' | 'neuralSearch'." },
      { status: 400 }
    );
  }

  try {
    const client = getServerAdminClient();
    const result = await client.setSettings({
      indexName,
      indexSettings: { mode: body.mode },
    });
    return NextResponse.json({
      ok: true,
      mode: body.mode,
      taskID: result.taskID,
      notice:
        body.mode === "neuralSearch"
          ? "NeuralSearch requires ≥1000 click events on the index. Algolia may continue serving keyword results until the model is warm."
          : null,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update index settings.";
    return NextResponse.json(
      { error: message, hint: "Is ALGOLIA_ADMIN_KEY set?" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = getServerAdminClient();
    const settings = await client.getSettings({ indexName });
    const mode =
      settings.mode === "neuralSearch" ? "neuralSearch" : "keywordSearch";
    return NextResponse.json({ ok: true, mode });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to read index settings.";
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
