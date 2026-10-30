// Reads and writes unit test attempts.
const {UNIT_TESTS_CSV_PATH} = require('../config');
const {readCsvFile, appendCsvRow} = require('./csv');

function readUnitTests() {
  return readCsvFile(UNIT_TESTS_CSV_PATH);
}

function appendUnitTestResult(result) {
  appendCsvRow(UNIT_TESTS_CSV_PATH, [
    result.student_id,
    result.unit,
    result.skill,
    result.case_id,
    result.passed,
    result.completed_at
  ]);
}

module.exports = {readUnitTests, appendUnitTestResult};
