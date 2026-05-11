import {
  parseMonth,
  parseSetNumber,
  parseYear,
  preparePaperAsset,
  printPreparedPaper
} from "./prepare-paper-lib";

async function main() {
  const [yearArg, monthArg, setNumberArg, sourcePdfArg] = process.argv.slice(2);

  if (!yearArg || !monthArg || !setNumberArg || !sourcePdfArg) {
    console.error("用法: npm run prepare:paper -- <year> <month> <setNumber> <sourcePdfPath>");
    process.exit(1);
  }

  const year = parseYear(yearArg);
  const month = parseMonth(monthArg);
  const setNumber = parseSetNumber(setNumberArg);
  const result = await preparePaperAsset(year, month, setNumber, sourcePdfArg);

  printPreparedPaper(result);
}

main().catch((error) => {
  console.error("prepare paper failed");
  console.error(error);
  process.exit(1);
});
