import { stripBase64Prefix } from "./met";

export const setCellContents = async ({ cell, value }: { cell: string; value: string }) => {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const range = sheet.getRange(cell);
      range.values = [[value]];
      await context.sync();
    });
  } catch (e) {
    throw e;
  }
};

export const addImageToShapes = async (base64Image: string) => {
  try {
    await Excel.run(async (context) => {
      const sheet = context.workbook.worksheets.getActiveWorksheet();
      const image = sheet.shapes.addImage(stripBase64Prefix(base64Image));
      image.name = "Image";
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

// reference https://learn.microsoft.com/en-us/javascript/api/excel/excel.shapecollection?view=excel-js-preview#excel-excel-shapecollection-addimage-member(1)

// const getActiveWorksheet = async () => {
//   await Excel.run(async (context) => {
// const sheet = context.workbook.worksheets.getActiveWorksheet();
//     sheet.load("name");
//     await context.sync();
//     console.log(sheet.name);
//     return sheet.name;
//   }
// }
