// Reads and writes CSV files.
const fs = require('fs');

function splitCsvLine(line) {
  const values = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === '"') {
      if (quoted && line[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += character;
    }
  }

  values.push(value.trim());
  return values;
}

function readCsvFile(filePath) {
  const lines = fs.readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(line => line.trim());

  if (lines.length === 0) {
    return [];
  }

  const headers = splitCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((record, header, columnIndex) => {
      record[header] = values[columnIndex] || '';
      return record;
    }, {});
  });
}

function csvValue(value) {
  const text = String(value ?? '');
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function appendCsvRow(filePath, values) {
  fs.appendFileSync(filePath, `\n${values.map(csvValue).join(',')}`);
}

module.exports = {splitCsvLine, readCsvFile, csvValue, appendCsvRow};
