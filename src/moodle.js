const moodleToken = localStorage.getItem('moodleToken');
const moodleUserID = localStorage.getItem('moodleUserID');
const firstName = localStorage.getItem('firstName');

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!moodleToken || !moodleUserID || !firstName) {
    return;
  }

  const assignmentReq = await fetch(
    'https://upvisayas.net/lms3/webservice/rest/server.php?moodlewsrestformat=json',
    {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `wstoken=${moodleToken}&wsfunction=mod_assign_get_assignments`,
    }
  );

  const currentDate = new Date();

  const workDue = [];
  const assRes = await assignmentReq.json();

  for (const course of assRes.courses) {
    for (const assignment of course.assignments) {
      if (assignment.duedate) {
        const due = new Date(0);
        due.setUTCSeconds(assignment.duedate);

        if (currentDate < due) {
          workDue.push({ name: assignment.name, due });
        }
      }
    }
  }

  const forumReq = await fetch(
    'https://upvisayas.net/lms3/webservice/rest/server.php?moodlewsrestformat=json',
    {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `wstoken=${moodleToken}&wsfunction=mod_forum_get_forums_by_courses`,
    }
  );

  const forums = await forumReq.json();

  for (const forum of forums) {
    if (forum.cutoffdate > 0 || forum.duedate > 0) {
      const due = new Date(0);
      due.setUTCSeconds(forum.duedate || forum.cutoffdate);

      if (currentDate < due) {
        workDue.push({ name: forum.name, due });
      }
    }
  }

  localStorage.setItem('assignments', JSON.stringify(workDue));
});
