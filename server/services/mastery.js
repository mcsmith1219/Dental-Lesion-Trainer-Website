// Updates a student's stored skill mastery.
const bkt = require('./bkt');
const {readBktMastery, writeBktMastery} = require('../store/mastery');

function updateBktMasteryCsv(userId, skillName, correct) {
  const rows = readBktMastery();
  const studentId = String(userId).padStart(5, '0');
  let mastery = rows.find(row => row.student_id === studentId && row.skill === skillName);

  if (!mastery) {
    mastery = {
      student_id: studentId,
      skill: skillName,
      kc_id: skillName,
      mastery_probability: bkt.DEFAULT_PARAMS.pInit,
      observations: 0,
      last_updated: ''
    };
    rows.push(mastery);
  }

  const priorPKnow = Number(mastery.mastery_probability);
  const updatedPKnow = bkt.recordAttempt(
    skillName,
    Number.isFinite(priorPKnow) ? priorPKnow : null,
    correct
  );
  mastery.mastery_probability = updatedPKnow;
  mastery.observations = Number(mastery.observations || 0) + 1;
  mastery.last_updated = new Date().toISOString();
  writeBktMastery(rows);

  return mastery;
}

module.exports = {updateBktMasteryCsv};
