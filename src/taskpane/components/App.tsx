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
import { getObjectDetailsById, getObjectIdsBySearchTerm } from "../../api/met";
import { setCellContents } from "../../api/excel";

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
  const [imageURL, setImageURL] = useState<string | null>(null);
  const onSearch = async (searchTerm) => {
    const objectIDs = await getObjectIdsBySearchTerm({ searchTerm });
    const { artistDisplayName, title, primaryImageSmall } = await getObjectDetailsById({ objectId: objectIDs?.[0] });
    setArtist(artistDisplayName);
    setTitle(title);
    setImageURL(primaryImageSmall);
  };

  useEffect(() => {
    if (artist && title && imageURL) {
      setCellContents({ cell: "A1", value: artist });
      setCellContents({ cell: "A2", value: title });
    }
  }, [artist, title, imageURL]);

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
