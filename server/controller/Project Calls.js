
function getProjectCalls(projectId) {

  // Get all calls for the given projectId
  const calls = FirebaseDatabase.getList(`projectCalls/${projectId}`);
  console.log("Found %s calls for project %s", calls.length, projectId);
  return calls;

}