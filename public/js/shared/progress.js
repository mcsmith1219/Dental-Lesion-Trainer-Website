// Saves and fetches student progress.
async function saveProgress(caseId, partOneCorrect, partTwoCorrect, hintsUsed, skillName) {
  const user = getCurrentUser();

  if (!user) {
    console.warn('No user logged in, progress not saved');
    return null;
  }

  try {
    const response = await fetch('/api/progress/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: user.id,
        caseId: caseId,
        partOneCorrect: partOneCorrect,
        partTwoCorrect: partTwoCorrect,
        hintsUsed: hintsUsed,
        skillName: skillName
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save progress');
    }

    return data.progress;
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

async function saveUnitTestResult(unit, caseId, passed) {
  const user = getCurrentUser();

  if (!user) {
    console.warn('No user logged in, test result not saved');
    return null;
  }

  try {
    const response = await fetch('/api/tests/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({userId: user.id, unit, caseId, passed})
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save test result');
    }

    return data;
  } catch (error) {
    console.error('Error saving unit test result:', error);
  }
}

async function getUserProgress() {
  const user = getCurrentUser();

  if (!user) {
    console.warn('No user logged in');
    return null;
  }

  try {
    const response = await fetch(`/api/progress/${user.id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch progress');
    }

    return data;
  } catch (error) {
    console.error('Error fetching progress:', error);
  }
}

async function getCaseProgress(caseId) {
  const user = getCurrentUser();

  if (!user) {
    console.warn('No user logged in');
    return null;
  }

  try {
    const response = await fetch(`/api/progress/${user.id}/${caseId}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error('Progress not found');
    }

    return data;
  } catch (error) {
    console.error('Error fetching case progress:', error);
  }
}

async function getUserSkills() {
  const user = getCurrentUser();

  if (!user) {
    console.warn('No user logged in');
    return null;
  }

  try {
    const response = await fetch(`/api/skills/${user.id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch skill mastery');
    }

    return data;
  } catch (error) {
    console.error('Error fetching skill mastery:', error);
  }
}

async function getUserStats() {
  const user = getCurrentUser();

  if (!user) {
    console.warn('No user logged in');
    return null;
  }

  try {
    const response = await fetch(`/api/stats/${user.id}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }

    return data;
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
}
