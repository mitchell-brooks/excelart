import { MetObject, MetSearchResponse } from "../types";

export const getObjectIdsBySearchTerm = async ({
  searchTerm,
  highlightsOnly = false,
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

export const getImageFromURL = async (url: string) => {
  const image = await fetch(url, { mode: "cors" }).then((res) => res.blob());
  return image;
};

export const convertImageToBase64 = async (image: Blob) => {
  let base64;
  try {
    base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  } catch (e) {
    throw e;
  }
  // TODO fix typecast with type guard
  return base64 as string;
};

export const stripBase64Prefix = (base64: string) => {
  const startIndex = base64.indexOf("base64,");
  const myBase64 = base64.substr(startIndex + 7);
  return myBase64;
};
