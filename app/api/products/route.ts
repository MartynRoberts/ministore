import { searchCatalogue } from "@/lib/catalogue";
import { parseCatalogueQuery } from "@/lib/catalogue-query";
import { getShopSession } from "@/app/actions/shop";

export async function GET(request: Request) {
  const query = parseCatalogueQuery(new URL(request.url).searchParams);
  try {
    const favourites = query.favsOnly ? (await getShopSession()).favs : [];
    const result = await searchCatalogue(query, favourites);
    return Response.json(result, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "Unable to load products. Please try again." }, { status: 503 });
  }
}
