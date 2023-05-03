/* global Excel */

export const writeToRange = async ({
  topLeftCell,
  values,
  bold = false,
  italic = false,
}: {
  topLeftCell: string;
  values: string[][];
  bold?: boolean;
  italic?: boolean;
}) => {
  const numRows = values.length;
  const numColumns = values[0].length;
  let range;
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      range = sheet.getRange(topLeftCell).getAbsoluteResizedRange(numRows, numColumns);
      range.values = values;
      range.format.font.bold = bold;
      range.format.font.italic = italic;
      await context.sync();
    });
  } catch (e) {
    throw e;
  }
  return range;
};

export const clearRange = async ({
  cell,
  numRows = 1,
  numColumns = 1,
}: {
  cell: string;
  numRows?: number;
  numColumns?: number;
}) => {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(cell).getAbsoluteResizedRange(numRows, numColumns);
      range.clear();
      await context.sync();
    });
  } catch (e) {
    throw e;
  }
};

// implemented the ability to download image and display it as a shape in the workbook, but ultimately decided
// against including the feature
export const addImageToShapes = async (base64Image: string) => {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const image = sheet.shapes.addImage(stripBase64Prefix(base64Image));
      image.name = "MetImage";
      image.left = 0;
      image.top = 0;
      image.height = 100;
      image.width = 100;
      return context.sync();
    });
  } catch (e) {
    throw e;
  }
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

// reference https://learn.microsoft.com/en-us/javascript/api/excel/excel.shapecollection?view=excel-js-preview#excel-excel-shapecollection-addimage-member(1)
