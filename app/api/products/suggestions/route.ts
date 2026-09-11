import { searchCatalogue } from "@/lib/catalogue";
import { parseCatalogueQuery } from "@/lib/catalogue-query";

export async function GET(request: Request) {
  const query = parseCatalogueQuery(new URL(request.url).searchParams);
  if (query.search.length < 2) return Response.json({ items: [], total: 0 });
  try {
    const result = await searchCatalogue({ ...query, category: "", sort: "relevance", page: 1, pageSize: 4, favsOnly: false });
    return Response.json({
      items: result.items.map(({ id, title, image, category }) => ({ id, title, image, category })),
      total: result.total,
    }, {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch {
    return Response.json({ error: "Suggestions are unavailable." }, { status: 503 });
  }
}
