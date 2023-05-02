import * as React from "react";
import { DefaultButton } from "@fluentui/react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import Progress from "./Progress";
import {SearchBox} from "@fluentui/react";
import {useState} from "react";

/* global console, Excel, require  */

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

const getObjectIdsBySearchTerm = async ({searchTerm}: {searchTerm: string}): Promise<any> => {
    console.log(searchTerm)
    const highlightsOnly = true
  const results = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=${highlightsOnly}&q=${searchTerm}`, {mode: 'cors'}).then(res => res.json())
   console.log(results)
  return results
}

export const App: React.FC<AppProps> = ({title= "Spreadshart", isOfficeInitialized}) => {
console.log("App rendering")
    const onSearch = async (searchTerm) => {
    const results = await getObjectIdsBySearchTerm({searchTerm})
        setResults(results)
    }

  const [results, setResults] = useState(null)
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
      <div className="ms-welcome">
        <Header logo={require("./../../../assets/logo-filled.png")} title={title} message="Welcome" />
        <SearchBox placeholder={"Find an artist"} onSearch={searchTerm => onSearch(searchTerm) }/>
          <DefaultButton className="ms-welcome__action" iconProps={{ iconName: "ChevronRight" }} onClick={()=>{}}>
            Run
          </DefaultButton>
          {/*<pre>{results?.body}</pre>*/}
      </div>
  );
}

export default App

