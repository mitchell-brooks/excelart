/* global fetch */

import { MetObject, MetSearchResponse } from "../types";
export const getObjectIdsBySearchTerm = async ({
  searchTerm,
  highlightsOnly = false,
}: {
  searchTerm: string;
  highlightsOnly?: boolean;
}): Promise<number[]> => {
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
  return await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`, {
    mode: "cors",
  }).then((res) => res.json());
};

export const getImageFromURL = async (url: string) => {
  return await fetch(url, { mode: "cors" }).then((res) => res.blob());
};
