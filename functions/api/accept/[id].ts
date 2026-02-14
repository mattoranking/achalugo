import { jsonResponse, errorResponse } from "../../utils/helpers";

/**
 * POST /api/accept/:id
 * Marks a valentine link as accepted.
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const id = context.params.id as string;

  if (!id) {
    return errorResponse("Link ID is required");
  }

  const raw = await context.env.ACHALUGO_KV.get(`link:${id}`);

  if (!raw) {
    return errorResponse("Valentine link not found", 404);
  }

  const record: LinkRecord = JSON.parse(raw);

  if (record.accepted) {
    return jsonResponse({ alreadyAccepted: true, senderName: record.senderName, recipientName: record.recipientName, youtubeUrl: record.youtubeUrl || null });
  }

  record.accepted = true;
  await context.env.ACHALUGO_KV.put(`link:${id}`, JSON.stringify(record));

  return jsonResponse({
    success: true,
    senderName: record.senderName,
    recipientName: record.recipientName,
    youtubeUrl: record.youtubeUrl || null,
  });
};
