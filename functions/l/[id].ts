/**
 * GET /l/:id
 * Serves valentine.html for any /l/:id route.
 * The frontend JS extracts the ID from the URL path.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  // Fetch valentine.html from static assets
  const url = new URL(context.request.url);
  url.pathname = "/valentine.html";
  return context.env.ASSETS.fetch(url);
};
