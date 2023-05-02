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

// const getActiveWorksheet = async () => {
//   await Excel.run(async (context) => {
// const sheet = context.workbook.worksheets.getActiveWorksheet();
//     sheet.load("name");
//     await context.sync();
//     console.log(sheet.name);
//     return sheet.name;
//   }
// }
