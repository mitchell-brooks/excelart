import * as React from "react";
import { DefaultButton } from "@fluentui/react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import Progress from "./Progress";
import { SearchBox } from "@fluentui/react";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MetObject, MetSearchResponse } from "../../types";
import { convertImageToBase64, getImageFromURL, getObjectDetailsById, getObjectIdsBySearchTerm } from "../../api/met";
import { addImageToShapes, setCellContents } from "../../api/excel";

/* global console, Excel, require  */

export interface AppProps {
  isOfficeInitialized: boolean;
}

type ArtObjectState = {
  artist: MetObject["artistDisplayName"];
  title: MetObject["title"];
  imageURL: MetObject["primaryImageSmall"];
};

const queryClient = new QueryClient();

export const App: React.FC<AppProps> = ({ isOfficeInitialized }) => {
  console.log("App rendering");

  const [artist, setArtist] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const onSearch = async (searchTerm) => {
    const objectIDs = await getObjectIdsBySearchTerm({ searchTerm });
    const { artistDisplayName, title, primaryImageSmall } = await getObjectDetailsById({ objectId: objectIDs?.[0] });
    const imageBlob = await getImageFromURL(primaryImageSmall);
    const convertedImage = await convertImageToBase64(imageBlob);
    console.log({ imageBlob, convertedImage });
    setArtist(artistDisplayName);
    setTitle(title);
    setBase64Image(convertedImage);
  };

  useEffect(() => {
    if (artist && title && base64Image) {
      setCellContents({ cell: "A1", value: artist });
      setCellContents({ cell: "A2", value: title });
      addImageToShapes(base64Image);
    }
  }, [artist, title, base64Image]);

  if (!isOfficeInitialized) {
    return (
      <Progress
        title={title}
        logo={require("./../../../assets/logo-filled.png")}
        message="Please sideload your addin to see app body."
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="ms-welcome">
        <Header logo={require("./../../../assets/logo-filled.png")} title={"SpreadshArt"} message="Welcome" />
        <SearchBox placeholder={"Find an artist"} onSearch={(searchTerm) => onSearch(searchTerm)} />
        <DefaultButton className="ms-welcome__action" iconProps={{ iconName: "ChevronRight" }} onClick={() => {}}>
          Run
        </DefaultButton>
        {/*<pre>{results?.body}</pre>*/}
      </div>
    </QueryClientProvider>
  );
};

export default App;
