// Starts the case page.
loadCasesFromApi().then(async function (loadedCases) {
  cases = loadedCases;

  if (cases.length === 0) {
    caseTitle.textContent = "No cases available";
    questionPrompt.textContent = "No case data was returned by the server. Run \"npm run import-data\" to load data/cases.csv into the database.";
    return;
  }

  const requestedCaseId = new URLSearchParams(window.location.search).get("caseId");
  let requestedIndex = cases.findIndex(currentCase => currentCase.caseId === requestedCaseId);

  if (requestedCaseId && requestedIndex < 0) {
    const resolvedCase = await loadSingleCaseFromApi(requestedCaseId);
    if (resolvedCase) {
      cases.push(resolvedCase);
      requestedIndex = cases.length - 1;
    }
  }

  currentCaseIndex = requestedIndex >= 0 ? requestedIndex : 0;
  loadCase();
});
