// Unit test status and unlock rules.
const {UNIT_CATEGORIES} = require('../config');
const {readUnitTests} = require('../store/unit-tests');

function getUnitTestStatus(studentId) {
  const rows = readUnitTests().filter(row => row.student_id === studentId);
  const status = {};
  Object.keys(UNIT_CATEGORIES).forEach(unit => {
    status[unit] = rows.some(row => row.unit === unit && row.passed === 'true');
  });
  return status;
}

function getUnlockedUnits(studentId) {
  const status = getUnitTestStatus(studentId);
  const unlocked = [1];
  for (let unit = 2; unit <= Object.keys(UNIT_CATEGORIES).length; unit += 1) {
    if (status[unit - 1]) {
      unlocked.push(unit);
    } else {
      break;
    }
  }
  return unlocked;
}

module.exports = {getUnitTestStatus, getUnlockedUnits};
