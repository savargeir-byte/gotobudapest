import type { StructureResolver } from "sanity/structure";

// Types that exist exactly once and must not be created, duplicated or deleted.
export const singletonTypes = new Set(["siteSettings"]);

export const structure: StructureResolver = (S) =>
  S.list()
    .title("GoToBudapest")
    .items([
      S.listItem()
        .title("Site settings")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.divider(),
      S.listItem()
        .title("Attractions")
        .schemaType("attraction")
        .child(
          S.list()
            .title("Attractions")
            .items([
              S.listItem()
                .title("All attractions")
                .child(
                  S.documentTypeList("attraction")
                    .title("All attractions")
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),
              S.listItem()
                .title("Featured on the homepage")
                .child(
                  S.documentList()
                    .title("Featured attractions")
                    .schemaType("attraction")
                    .filter('_type == "attraction" && featured == true')
                    .defaultOrdering([{ field: "order", direction: "asc" }]),
                ),
              S.listItem()
                .title("By category")
                .child(
                  S.documentList()
                    .title("Attraction categories")
                    .schemaType("category")
                    .filter('_type == "category" && kind == "attraction"')
                    .child((categoryId) =>
                      S.documentList()
                        .title("Attractions")
                        .schemaType("attraction")
                        .filter(
                          '_type == "attraction" && category._ref == $categoryId',
                        )
                        .params({ categoryId })
                        .defaultOrdering([{ field: "order", direction: "asc" }]),
                    ),
                ),
            ]),
        ),
      S.documentTypeListItem("guide").title("Travel guides"),
      S.documentTypeListItem("experience").title("Experiences"),
      S.documentTypeListItem("neighbourhood").title("Neighbourhoods"),
      S.divider(),
      S.documentTypeListItem("region").title("Regions / districts"),
      S.documentTypeListItem("category").title("Categories"),
    ]);
