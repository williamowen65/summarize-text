/**
 * Set a timed trigger every intervalMinutes.
 */
function setMinutesTrigger(functionName, intervalMinutes)
{
  // Avoid duplicate triggers.
  deleteTriggerByName(functionName);

  var trigger = ScriptApp.newTrigger(functionName)
    .timeBased()
    .everyMinutes(intervalMinutes)
    .create();
  console.log("Created trigger for '%s' with id %s, to run every %s minutes", functionName, trigger.getUniqueId(), intervalMinutes)
  return trigger.getUniqueId();
}

/**
 * Set a timed trigger.
 */
function setMonthlyTrigger(functionName, dayOfMonth, hour)
{
  // Avoid duplicate triggers.
  deleteTriggerByName(functionName);

  var trigger = ScriptApp.newTrigger(functionName)
    .timeBased()
    .onMonthDay(dayOfMonth)
    .atHour(hour)
    .create();
  console.log("Created trigger for '%s' with id %s, to run on the %s-th of each month at hour %s", functionName, trigger.getUniqueId(), dayOfMonth, hour)
  return trigger.getUniqueId();
}

/**
 * Set a timed trigger once an hour
 */
function setHourlyTrigger(functionName)
{
  // Avoid duplicate triggers.
  deleteTriggerByName(functionName);

  var trigger = ScriptApp.newTrigger(functionName)
    .timeBased()
    .everyHours(1)
    .create();
  console.log("Created trigger for '%s' with id %s to run hourly", functionName, trigger.getUniqueId())
  return trigger.getUniqueId();
}

/**
 * Set a timed trigger.
 */
function setWeeklyTrigger(functionName, weekday, hour)
{
  // Avoid duplicate triggers.
  deleteTriggerByName(functionName);

  var trigger = ScriptApp.newTrigger(functionName)
    .timeBased()
    .everyWeeks(1)
    .onWeekDay(weekday)
    .atHour(hour)
    .create();
  console.log("Created trigger for '%s' with id %s, to run on %s of each week at hour %s", functionName, trigger.getUniqueId(), weekday, hour)
  return trigger.getUniqueId();
}

/**
 * Set a trigger for form submission
 */
function setFormSubmitTrigger(functionName)
{
  // Avoid duplicate triggers.
  deleteTriggerByName(functionName);

  var trigger = ScriptApp.newTrigger(functionName)
    .forSpreadsheet(SS)
    .onFormSubmit()
    .create();
  console.log("Created trigger for '%s' with id %s, to run on form submit", functionName, trigger.getUniqueId())
  return trigger.getUniqueId();
}

/**
 * Set a timed trigger once a day
 */
function setDailyTrigger(functionName, hour)
{
  // Avoid duplicate triggers.
  deleteTriggerByName(functionName);

  var trigger = ScriptApp.newTrigger(functionName)
    .timeBased()
    .everyDays(1)
    .atHour(hour)
    .create();
  console.log("Created trigger for '%s' with id %s to run daily at hour %s", functionName, trigger.getUniqueId(), hour)
  return trigger.getUniqueId();
}

/**
 * Set an installed change trigger.
 */
function setChangeTrigger(functionName)
{
  // Avoid duplicate triggers.
  deleteTriggerByName(functionName);

  var trigger = ScriptApp.newTrigger(functionName)
    .forSpreadsheet(SS)
    .onChange()
    .create();
  console.log("Created trigger for '%s' with id %s", functionName, trigger.getUniqueId())
  return trigger.getUniqueId();
}

/**
 * Set an installed onEdit trigger.
 */
function setEditTrigger(functionName)
{
  // Avoid duplicate triggers.
  deleteTriggerByName(functionName);

  var trigger = ScriptApp.newTrigger(functionName)
    .forSpreadsheet(SS)
    .onEdit()
    .create();
  console.log("Created trigger for '%s' with id %s", functionName, trigger.getUniqueId())
  return trigger.getUniqueId();
}

/**
 * Delete any trigger assigned to the given function.
 * @param {string} functionName
 */
function deleteTriggerByName(functionName)
{
  // Find all existing triggers for the function, if they exist, and delete them
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (trigger)
  {
    if (trigger.getHandlerFunction() == functionName)
    {
      console.log("Removing trigger for '%s' with id %s", functionName, trigger.getUniqueId())
      ScriptApp.deleteTrigger(trigger);
    }
  })
}

/**
 * Delete any trigger assigned to the given function.
 * @param {string} id
 */
function deleteTriggerById(id)
{
  // Find all existing triggers for the function, if they exist, and delete them
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (trigger)
  {
    if (trigger.getUniqueId() == id)
    {
      console.log("Removing trigger for '%s' with id %s", trigger.getHandlerFunction(), id)
      ScriptApp.deleteTrigger(trigger);
    }
  })
}


/**
 * Deletes all triggers of the specified type, or all triggers if no type is given.
 * @param {Enum EventType} triggerType The Event Type
 * ScriptApp.EventType.CLOCK
 * ScriptApp.EventType.ON_EDIT
 * ScriptApp.EventType.ON_FORM_SUBMIT
 * ScriptApp.EventType.ON_OPEN
 * ScriptApp.EventType.ON_EVENT_UPDATED
 * ScriptApp.EventType.ON_CHANGE
 * For more details see https://developers.google.com/apps-script/reference/script/event-type.html
 */
function deleteAllTriggers(triggerType)
{
  // Loop over all triggers.
  var allTriggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < allTriggers.length; i++)
  {
    if (!triggerType || allTriggers[i].getEventType() == triggerType)
    {
      // Delete each trigger.
      ScriptApp.deleteTrigger(allTriggers[i]);
    }
  }
}


/**
 * Toggle the trigger assigned to a particular function.
 * @param {number} interval
 */
function toggleTrigger(functionName)
{
  // Find all existing triggers for the function, if they exist, and delete them
  var currentTrigger = false;
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function (trigger)
  {
    if (trigger.getHandlerFunction() == functionName)
    {
      currentTrigger = true;
      ScriptApp.deleteTrigger(trigger);
    }
  })
  if (currentTrigger)
  {
    // Display a message on the UI
    SpreadsheetApp.getActive().toast("Trigger is now OFF.")
  } else
  {
    // If no trigger was found, create a trigger.
    ScriptApp.newTrigger(functionName)
      // Apply the desired trigger type here.
      .forSpreadsheet()
      .onChange()
      .create();
    // Display a message on the UI
    SpreadsheetApp.getActive().toast("Trigger is now ON.")
  }
}

/*
Time-driven triggers have an Event object.  Here is a sample:
{
  "hour":4,
  "day-of-week":3,
  "minute":49,
  "month":12,
  "day-of-month":30,
  "timezone":"UTC",
  "year":2020,
  "triggerUid":"5600481",
  "week-of-year":53,
  "authMode":"FULL",
  "second":49
}
*/

