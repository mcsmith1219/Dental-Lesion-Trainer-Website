// Reads and writes skill mastery.
const fs = require('fs');
const {BKT_MASTERY_CSV_PATH} = require('../config');
const {readCsvFile, csvValue} = require('./csv');

const HEADERS = [
  'student_id',
  'skill',
  'kc_id',
  'mastery_probability',
  'observations',
  'last_updated'
];

function readBktMastery() {
  return readCsvFile(BKT_MASTERY_CSV_PATH);
}

function writeBktMastery(rows) {
  const csvRows = rows.map(row => HEADERS.map(header => csvValue(row[header])).join(','));
  fs.writeFileSync(BKT_MASTERY_CSV_PATH, `${HEADERS.join(',')}\n${csvRows.join('\n')}\n`);
}

module.exports = {readBktMastery, writeBktMastery};
