import ExcelJS from "exceljs";

export async function buildWorkbookBuffer(
  title: string,
  rows: Record<string, unknown>[]
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title);

  if (rows.length > 0) {
    sheet.columns = Object.keys(rows[0]).map((key) => ({
      header: key,
      key,
      width: 20
    }));
    sheet.addRows(rows);
  }

  return workbook.xlsx.writeBuffer();
}

