import { useEffect, useState } from "react";
import { MetObject, MetSearchResponse } from "../../types";
import { convertImageToBase64, getImageFromURL, getObjectDetailsById, getObjectIdsBySearchTerm } from "../../api/met";
import { clearRange, writeToRange } from "../../api/excel";
import { Checkbox, CheckboxBase, DropdownBase, SearchBox, Slider, Stack, StackItem } from "@fluentui/react";
import * as React from "react";
import { useQuery } from "@tanstack/react-query";

const DEFAULT_PROPERTIES = ["title", "artistDisplayName"] as const;
const ADDITIONAL_PROPERTIES = ["artistDisplayBio", "objectDate", "medium"] as const;
type AdditionalProperties = (typeof ADDITIONAL_PROPERTIES)[number];
type AllProperties = (typeof DEFAULT_PROPERTIES)[number] | AdditionalProperties;
const MAX_NUMBER_OF_PROPERTIES = DEFAULT_PROPERTIES.length + ADDITIONAL_PROPERTIES.length;
const MAX_NUMBER_OF_ITEMS = 50;
const toSentenceCase = (str: string) =>
  str
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/^./, (match) => match.toUpperCase())
    .trim();

export const ArtSearch = () => {
  const [additionalProperties, setAdditionalProperties] = useState<Record<AdditionalProperties, boolean>>(() =>
    // create an object with all additional properties to track checkboxes
    Object.assign({}, ...ADDITIONAL_PROPERTIES.map((k) => ({ [k]: false })))
  );
  // get all selected additional properties
  const selectedAdditionalProperties = Object.entries(additionalProperties)
    .map(([k, v]) => (v ? k : null))
    .filter((k) => k);
  // combine with default properties
  const allDisplayProperties = [...DEFAULT_PROPERTIES, ...selectedAdditionalProperties] as AllProperties[];

  const additionalPropertiesCheckboxes = ADDITIONAL_PROPERTIES.map((property) => (
    <div key={property}>
      <Checkbox
        label={toSentenceCase(property)}
        checked={additionalProperties[property]}
        onChange={(_e, checked) => setAdditionalProperties((s) => ({ ...s, [property]: checked }))}
      />
    </div>
  ));

  const [results, setResults] = useState<MetObject[]>([]);
  const [rangeData, setRangeData] = useState<string[][] | null>(null);
  const [numberOfItems, setNumberOfItems] = useState<number>(5);

  const formatAndDisplayHeaders = () => {
    writeToRange({
      topLeftCell: "A1",
      values: [allDisplayProperties.map((prop) => toSentenceCase(prop))],
    });
  };

  const onSearch = async (searchTerm) => {
    clearRange({ cell: "A1", numRows: MAX_NUMBER_OF_ITEMS + 1, numColumns: MAX_NUMBER_OF_PROPERTIES });
    formatAndDisplayHeaders();
    const objectIDs = await getObjectIdsBySearchTerm({ searchTerm });
    const objects = await Promise.all(
      objectIDs.slice(0, numberOfItems).map((objectId) => getObjectDetailsById({ objectId }))
    );
    createRangeDataFromResults(objects);
  };

  const createRangeDataFromResults = (results: MetObject[]) => {
    const rangeData = results.map((object) => allDisplayProperties.map((prop) => object[prop]));
    writeToRange({ topLeftCell: "A2", values: rangeData });
  };

  useEffect(() => {
    console.log("::: in useEffect allDisplayProperties");

    createRangeDataFromResults(results);
  }, []);

  useEffect(() => {
    console.log("::: in useEffect");
  }, []);

  return (
    <>
      <SearchBox placeholder={"Find an artist"} onSearch={(searchTerm) => onSearch(searchTerm)} />
      <Slider label="Number of items to display" max={50} value={numberOfItems} showValue onChange={setNumberOfItems} />
      <h3>Additional properties</h3>
      {additionalPropertiesCheckboxes}
    </>
  );
};
