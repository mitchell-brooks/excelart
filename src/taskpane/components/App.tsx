import * as React from "react";
import Progress from "./Progress";
import { ArtSearch } from "./ArtSearch";

/* global console, Excel, require  */

export interface AppProps {
  isOfficeInitialized: boolean;
}

export const App: React.FC<AppProps> = ({ isOfficeInitialized }) => {
  if (!isOfficeInitialized) {
    return (
      <Progress
        title={"ExcelArt"}
        logo={require("./../../../assets/logo-filled.png")}
        message="Please sideload your addin to see app body."
      />
    );
  }

  return (
    <div style={{ padding: "0.25rem 1rem", height: "100%", backgroundColor: "white" }}>
      <h1>ExcelArt</h1>
      <p>Bringing the Metropolitan Museum of Art to your Excel Workbook</p>
      <ArtSearch />
    </div>
  );
};

export default App;
