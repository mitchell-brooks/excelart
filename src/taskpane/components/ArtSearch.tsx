import { useCallback, useState } from "react";
import { MetObject } from "../../types";
import { getObjectDetailsById, getObjectIdsBySearchTerm } from "../../api/met";
import { clearRange, writeToRange } from "../../api/excel";
import { Button, Checkbox, SearchBox, Slider } from "@fluentui/react";
import * as React from "react";

const DEFAULT_PROPERTIES = ["title", "artistDisplayName"] as const;
const ADDITIONAL_PROPERTIES = [
  "artistDisplayBio",
  "objectDate",
  "medium",
  "country",
  "city",
  "period",
  "department",
  "primaryImage",
] as const;
type AdditionalProperties = (typeof ADDITIONAL_PROPERTIES)[number];
type AllProperties = (typeof DEFAULT_PROPERTIES)[number] | AdditionalProperties;
const MAX_NUMBER_OF_PROPERTIES = DEFAULT_PROPERTIES.length + ADDITIONAL_PROPERTIES.length;
const MAX_NUMBER_OF_ITEMS_PER_SEARCH = 50;
const FIRST_COLUMN = "A";
const FIRST_ROW = 1;
const toSentenceCase = (str: string) =>
  str
    .replace(/([A-Z])/g, (match) => ` ${match}`)
    .replace(/^./, (match) => match.toUpperCase())
    .trim();

const fetchItems = async (
  searchTerm: string,
  numberOfItemsToFetch = 5,
  totalFetchedItems = 0,
  highlightsOnly = false
): Promise<MetObject[]> => {
  const objectIDs = await getObjectIdsBySearchTerm({ searchTerm, highlightsOnly });
  const startIdx = totalFetchedItems;
  let endIdx = totalFetchedItems + numberOfItemsToFetch;
  let allResultsFlag = false;
  if (endIdx > objectIDs.length) {
    endIdx = objectIDs.length;
    allResultsFlag = true;
  }
  const objects = await Promise.all(
    objectIDs.slice(startIdx, endIdx).map((objectId) => getObjectDetailsById({ objectId }))
  );
  if (allResultsFlag) {
    objects.push({ title: "NO MORE RESULTS" } as MetObject);
  }
  return objects;
};

const createAndWriteRangeDataFromResults = async (
  results: MetObject[],
  totalFetchedItems,
  allDisplayProperties: AllProperties[]
) => {
  const rangeData = results
    .map((object) => (object.title ? allDisplayProperties.map((prop) => object[prop]) : null))
    .filter((r) => r);
  await writeToRange({
    topLeftCell: `${FIRST_COLUMN}${FIRST_ROW + totalFetchedItems + 1}`,
    values: rangeData,
  });
  return rangeData;
};

const formatAndDisplayHeaders = async (allDisplayProperties: AllProperties[]) => {
  return await writeToRange({
    topLeftCell: `${FIRST_COLUMN}${FIRST_ROW}`,
    values: [allDisplayProperties.map((prop) => toSentenceCase(prop))],
    bold: true,
  });
};
export const ArtSearch = () => {
  const [numberOfItemsToFetch, setNumberOfItemsToFetch] = useState<number>(10);
  const [totalFetchedItems, setTotalFetchedItems] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [highlightsOnly, setHighlightsOnly] = useState<boolean>(true);
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
        label={property == "primaryImage" ? "Link To Image (if available)" : toSentenceCase(property)}
        checked={additionalProperties[property]}
        onChange={(_e, checked) => setAdditionalProperties((s) => ({ ...s, [property]: checked }))}
      />
    </div>
  ));

  const onClear = useCallback(async () => {
    await clearRange({
      cell: `${FIRST_COLUMN}${FIRST_ROW}`,
      numRows: Math.max(MAX_NUMBER_OF_ITEMS_PER_SEARCH * 5, totalFetchedItems) + 1,
      numColumns: MAX_NUMBER_OF_PROPERTIES,
    });
  }, [totalFetchedItems]);

  const onSearch = useCallback(
    async (searchTerm, allDisplayProperties) => {
      await onClear();
      await formatAndDisplayHeaders(allDisplayProperties);
      const items = await fetchItems(searchTerm, numberOfItemsToFetch, 0, highlightsOnly);
      const rangeData = await createAndWriteRangeDataFromResults(items, 0, allDisplayProperties);
      setTotalFetchedItems(rangeData.length);
    },
    [highlightsOnly, numberOfItemsToFetch, onClear]
  );

  const onMore = useCallback(
    async (searchTerm, allDisplayProperties) => {
      const items = await fetchItems(searchTerm, numberOfItemsToFetch, totalFetchedItems, highlightsOnly);
      const rangeData = await createAndWriteRangeDataFromResults(items, totalFetchedItems, allDisplayProperties);
      setTotalFetchedItems((s) => s + rangeData.length);
    },
    [highlightsOnly, numberOfItemsToFetch, totalFetchedItems]
  );

  return (
    <>
      <section>
        <SearchBox
          placeholder={"Enter a search term"}
          onSearch={() => onSearch(searchTerm, allDisplayProperties)}
          value={searchTerm}
          onChange={(_e, v) => setSearchTerm(v)}
        />
      </section>
      <br />
      <section>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button onClick={() => onSearch(searchTerm, allDisplayProperties)} disabled={!searchTerm}>
            Search
          </Button>
          <Button
            onClick={() => onMore(searchTerm, allDisplayProperties)}
            disabled={totalFetchedItems <= 0 || !searchTerm}
          >
            More
          </Button>
          <Button onClick={() => onClear()} disabled={totalFetchedItems <= 0}>
            Clear
          </Button>
        </div>
      </section>
      <br />
      <section>
        <Slider
          label="Number of items to display"
          max={50}
          value={numberOfItemsToFetch}
          showValue
          onChange={setNumberOfItemsToFetch}
        />
      </section>
      <section>
        <div>
          <Checkbox
            label="Only display highlighted pieces"
            checked={highlightsOnly}
            onChange={(_e, checked) => setHighlightsOnly(checked)}
          />
        </div>
      </section>
      <section>
        <h3>Additional properties to display:</h3>
        {additionalPropertiesCheckboxes}
      </section>
    </>
  );
};
