// Reads and writes student interactions.
const {USER_INTERACTIONS_CSV_PATH} = require('../config');
const {readCsvFile, appendCsvRow} = require('./csv');

function readUserInteractions() {
  return readCsvFile(USER_INTERACTIONS_CSV_PATH);
}

function appendUserInteraction(interaction) {
  appendCsvRow(USER_INTERACTIONS_CSV_PATH, [
    interaction.user_id,
    interaction.session_id,
    interaction.sequence,
    interaction.case_id,
    interaction.question_id,
    interaction.kc_id,
    interaction.student_response,
    interaction.correct,
    interaction.time_sec,
    interaction.hint_used,
    interaction.time_before_first_hint,
    interaction.attempts,
    interaction.answer_change_count,
    interaction.iou_score,
    interaction.timestamp
  ]);
}

module.exports = {readUserInteractions, appendUserInteraction};
