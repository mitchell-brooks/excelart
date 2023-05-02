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
import { addImageToShapes, writeToRange } from "../../api/excel";
import { ArtSearch } from "./art-search";

/* global console, Excel, require  */

export interface AppProps {
  isOfficeInitialized: boolean;
}

const queryClient = new QueryClient();

export const App: React.FC<AppProps> = ({ isOfficeInitialized }) => {
  console.log("App rendering");

  if (!isOfficeInitialized) {
    return (
      <Progress
        title={"SpreadshArt"}
        logo={require("./../../../assets/logo-filled.png")}
        message="Please sideload your addin to see app body."
      />
    );
  }

  return (
    <div className="ms-welcome">
      <Header logo={require("./../../../assets/logo-filled.png")} title={"SpreadshArt"} message="Welcome" />

      <ArtSearch />
    </div>
  );
};

export default App;
