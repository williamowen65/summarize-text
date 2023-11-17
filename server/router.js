
function doGet(e)
{
  try
  {

    var page = e.parameter.page || "home";

    let context = { urlParams: e.parameter, page: page };
    context.scriptUrl = getScriptUrl(context)
    console.log("Script URL is %s", context.scriptUrl)
    console.log("Script deployment type is %s", context.deploymentType)

    context = addPageContext(page, context, e)

    console.log("Loading page '" + page + "' with this context: " + JSON.stringify(context))

    return renderPage(context);
  }
  catch (err)
  {
    console.error("Error loading page:\n%s\n%s", err.message, err.stack)
    const template = HtmlService.createTemplateFromFile("pages/error")
    template.error = err
    return template.evaluate()
      .addMetaTag("viewport", "width=device-width, initial-scale=1, shrink-to-fit=no")
      .setTitle(APP_TITLE)
      .setFaviconUrl(BRAND_FAVICON_URL)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
  }
}

function addPageContext(page, context, e)
{
  switch (page)
  {
    default:
      break
  }
  return context
}

function renderPage(context)
{
  var template = HtmlService.createTemplateFromFile("pages/base");
  template.context = context;
  return template.evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1, shrink-to-fit=no")
    .setTitle(APP_TITLE)
    .setFaviconUrl(BRAND_FAVICON_URL)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

function include(filename, context)
{
  var template = HtmlService.createTemplateFromFile(filename);
  template.context = context;
  return template.evaluate().getContent();
}

function getScriptUrl(context)
{
  // Dev url for debug purposes
  // if (context && context.userEmail === DEV_EMAIL)
  // {
  //   return APP_DEV_URL
  // };

  // Production (deployed) url
  return ScriptApp.getService().getUrl();
}

/**
 * Return array of user roles and (in the case of sales users) surrogates
 * Surrogates are other sales users whose leads this user can see and manipulate
 * @param {string} userEmail
 */
function getUser(userEmail, users)
{
  console.log("User email is " + userEmail)
  var user = {
    email: userEmail,
    active: true,
    roles: { 'user': true }
  }

  // users
  // .find(function (u) { return u.email && u.email.toLocaleLowerCase() === userEmail.toLocaleLowerCase() })
  // User doesn't exist or is not active:
  if (!(user && user.active))
  {
    return { roles: { 'none': true } }
  }
  // User exists but has no assigned roles:
  if (!user.roles || Object.keys(user.roles).length === 0) user.roles = { 'none': true }

  // Add username (first part of email):
  user.userName = userEmail.split('@')[0].toLocaleLowerCase()
  return user
}


/**
 * Return array of user views (types of objects this user role can view)
 * @param {Object[]} userRoles
 */
function getUserViews(userRoles)
{
  let views = [USER_VIEW.USER]
  if (userRoles.admin)
  {
    views.push(USER_VIEW.ADMIN)
  }

  return views
}

/**
 * Determine whether the user has permission to view this page.
 * @param {string} page As passed in url
 * @param {string[]} userViews
 * @returns {boolean} Whether the user has permission to view this page
 */
function validateUserViewPermission(page, userViews)
{
  // if (/^admin/.test(page)) return userViews.includes(USER_VIEW.ADMIN)
  // None of the above?  (Like home page) everyone can view.
  return true;
}

