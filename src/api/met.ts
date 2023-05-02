import { MetObject, MetSearchResponse } from "../types";

export const getObjectIdsBySearchTerm = async ({
  searchTerm,
  highlightsOnly = true,
}: {
  searchTerm: string;
  highlightsOnly?: boolean;
}): Promise<number[]> => {
  console.log(searchTerm);
  const { objectIDs }: MetSearchResponse = await fetch(
    `https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=${highlightsOnly}&q=${searchTerm}`,
    { mode: "cors" }
  ).then((res) => res.json());
  if (objectIDs == null) {
    if (highlightsOnly) {
      return getObjectIdsBySearchTerm({ searchTerm, highlightsOnly: false });
    }
    return [];
  }
  return objectIDs;
};
export const getObjectDetailsById = async ({ objectId }: { objectId: number }): Promise<MetObject> => {
  // const { objectID, title, artistDisplayName, primaryImageSmall } = await fetch(
  const object = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`, {
    mode: "cors",
  }).then((res) => res.json());
  return object;
  // return { objectID, title, artistDisplayName, primaryImageSmall };
};
