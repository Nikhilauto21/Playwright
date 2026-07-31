import ExcelJS from 'exceljs';

export interface JobRecord {
  title: string;
  company: string;
  location: string;
  experience: string;
  posted: string;
  link: string;
  applied: boolean;
  appliedAt: string;
}

const HEADERS = ['Date', 'Title', 'Company', 'Location', 'Experience', 'Posted', 'Link', 'Applied', 'AppliedAt'];
const SHEET_NAME = 'Applications';
const LINK_COL = 7;

export class JobTracker {
  static async update(filePath: string, jobs: JobRecord[]): Promise<void> {
    const workbook = new ExcelJS.Workbook();
    let sheet = workbook.getWorksheet(SHEET_NAME);

    if (!sheet) {
      sheet = workbook.addWorksheet(SHEET_NAME);
      sheet.addRow(HEADERS);
      sheet.getRow(1).font = { bold: true };
    }

    const existingByLink = new Map<string, number>();
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const link = row.getCell(LINK_COL).value?.toString() ?? '';
      if (link) existingByLink.set(link, rowNumber);
    });

    const today = new Date().toISOString().slice(0, 10);
    for (const job of jobs) {
      const values = [
        today,
        job.title,
        job.company,
        job.location,
        job.experience,
        job.posted,
        job.link,
        job.applied ? 'Yes' : 'No',
        job.applied ? job.appliedAt : '',
      ];
      const existingRow = existingByLink.get(job.link);
      if (existingRow) {
        const row = sheet.getRow(existingRow);
        values.forEach((value, i) => {
          row.getCell(i + 1).value = value;
        });
        row.commit();
      } else {
        sheet.addRow(values);
      }
    }

    sheet.getColumn(1).width = 12;
    sheet.getColumn(2).width = 45;
    sheet.getColumn(3).width = 30;
    sheet.getColumn(4).width = 25;
    sheet.getColumn(5).width = 14;
    sheet.getColumn(6).width = 14;
    sheet.getColumn(7).width = 80;
    sheet.getColumn(8).width = 10;
    sheet.getColumn(9).width = 24;

    await workbook.xlsx.writeFile(filePath);
  }
}
