import { jsonResponse, errorResponse } from "../../utils/helpers";

/**
 * GET /api/link/:id
 * Fetches the link record by ID so the frontend can display names + status.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const id = context.params.id as string;

  if (!id) {
    return errorResponse("Link ID is required");
  }

  const raw = await context.env.ACHALUGO_KV.get(`link:${id}`);

  if (!raw) {
    return errorResponse("Valentine link not found", 404);
  }

  const record: LinkRecord = JSON.parse(raw);

  return jsonResponse({
    id: record.id,
    senderName: record.senderName,
    recipientName: record.recipientName,
    accepted: record.accepted,
  });
};
