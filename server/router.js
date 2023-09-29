

function doGet(e)
{
  try
  {
    // Get user email; if using sandbox, set a user manually
    var userEmail = Session.getEffectiveUser().getEmail()
    // if (Instance.instanceName !== 'production' || userEmail === DEV_EMAIL)
    //   userEmail = PROPERTY_STORE.getProperty('impersonate') ||
    //     'developer@cactusflowerapps.com';

    // const users = getUsers()
    var user = getUser(userEmail);
    if (user.roles.none)
    {
      console.warn("Attempted access by %s who is not on the user list", userEmail)
      return renderUnauthorizedPage(userEmail);
    }

    var page = e.parameter.page || "home";

    var userViews = getUserViews(user.roles)
    if (!validateUserViewPermission(page, userViews, e.parameter))
    {
      console.warn("%s attempted to access page %s without authorization", userEmail, page)
      return renderUnauthorizedPage(userEmail);
    }

    let context = {
      page: page,
      userEmail: userEmail,
      user: user,
      // users: hashObjects(users, "id"),
      userViews: userViews,
      urlParams: e.parameter,
      userName: userEmail.split('@')[0],
      options: getOptions(),
      settings: getUserSettings(),
      statusMap: STATUS_MAP,
      statusId: StatusId,
      statusName: StatusName,
      requiredStatusIdsToCreateLoan: REQUIRED_STATUS_IDS_TO_CREATE_LOAN,
      substatusId: SubstatusId
    };


    context.scriptUrl = getScriptUrl(context)

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
      .setTitle('Error - ' + APP_TITLE)
      .setFaviconUrl(BRAND_FAVICON_URL)
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
  }
}

function addPageContext(page, context, e)
{
  switch (page)
  {
    case 'loans':
      context.template = getBorrowerTrackerTemplate(context.urlParams.template)
      // context.partners = getPartners()
      const borrowerName = getBorrowerName(context.urlParams.id)
      context.tabTitle = 'BT - ' + borrowerName + ' - ' + APP_TITLE
      break
    case 'leads':
      context.pageSubtitle = getClientPortalSubtitle(context.urlParams.leadType)
      context.tabTitle = 'Client Portal - ' + context.pageSubtitle + ' - ' + APP_TITLE
      context.partners = getPartners()
      break
    case 'payroll/record':
      context.pageSubtitle = 'My Payroll'
      context.partners = getPartners()
      break
    case 'payroll/sheets':
      context.pageSubtitle = 'Payroll - Employee Sheets'
      context.partners = getPartners()
      break
    case 'payroll/fundings':
      context.pageSubtitle = 'Payroll - Company Fundings'
      context.partners = getPartners()
      break
    case 'payroll/run':
      context.NEXT_PAYDATE = getNextPayday(dayjs().format('YYYY-MM-DD'))
      context.pageSubtitle = 'Run Payroll'
      break
    case 'admin/users':
      context.pageSubtitle = 'Users'
      break
    case 'admin/home-value':
      context.pageSubtitle = 'Home Value Emails'
      break
    case 'partners/referral-partners':
      context.pageSubtitle = 'Referral Partners'
      break
    case 'admin/rate':
      context.pageSubtitle = 'Set Interest Rate'
      break
    case 'settings/sources':
      context.pageSubtitle = 'Lead Sources'
      break
    case 'admin/birthday-list':
      context.pageSubtitle = 'Birthday List'
      break
    default:
      break
  }
  if (/stats/i.test(page))
  {
    context.pageSubtitle = 'Production Stats'
  }
  if (context.pageSubtitle && !context.tabTitle)
    context.tabTitle = context.pageSubtitle + ' - ' + APP_TITLE
  return context
}

function renderUnauthorizedPage(userEmail)
{
  const template = HtmlService.createTemplateFromFile("pages/unauthorized")
  template.userEmail = userEmail
  return template.evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1, shrink-to-fit=no")
    .setTitle(APP_TITLE)
    .setFaviconUrl(BRAND_FAVICON_URL)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
}

function getClientPortalSubtitle(leadType)
{
  const titles = {
    'current': 'Current',
    'lead': 'Active Leads',
    'processing': 'Processing',
    'underwriting': 'Underwriting',
    'clear': 'Clear to Close',
    'funded': 'Funded',
    'past': 'Past Clients',
    'watch': 'Watch List',
    'dead': 'Dead',
    'all': 'All Leads',
    'partner': 'Referral Partners',
    'report': 'Call Reports',
    'prospect': 'Prospective Leads',
    'custom': 'Custom'
  }
  return titles[leadType]
}

function renderPage(context)
{
  var template = HtmlService.createTemplateFromFile("pages/base");
  template.context = context;
  template.firebaseConfig = Instance.firebaseConfig
  return template.evaluate()
    .addMetaTag("viewport", "width=device-width, initial-scale=1, shrink-to-fit=no")
    .setTitle(context.tabTitle || APP_TITLE)
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
  // Turned off since the dev email is a shared account used by admin
  // if (context && context.userEmail === DEV_EMAIL)
  // {
  //   return APP_DEV_URL
  // };

  // Production (deployed) url
  return ScriptApp.getService().getUrl();
}

/**
 * Return user object from db
 * @param {string} userEmail
 */
function getUser(userEmail)
{
  userEmail = userEmail.toLocaleLowerCase()
  console.log("User email is " + userEmail)

  let user;
  let userQuery = FirebaseDatabase.get('users', { orderByChild: 'email', equalTo: userEmail })
  console.log(userQuery)
  if (userQuery)
  {
    user = Object.values(userQuery)[0]
    user.id = Object.keys(userQuery)[0]
  }

  // // We cache the user ids by email in the script properties to avoid pulling all users from the database
  // const userLookup = JSON.parse(PROPERTY_STORE.getProperty("userLookup") || '{}')
  // let userId = userLookup[userEmail]
  // let user
  // if (userId)
  // {
  //   console.log("User ID is %s", userId);
  //   user = FirebaseDatabase.get(`users/${userId}`)
  //   user.id = userId
  // } else
  // {
  //   console.log("Searching for user in database")
  //   user = getUsers()
  //     .find(function (u) { return u.email && u.email.toLocaleLowerCase() === userEmail })
  //   if (user)
  //   {
  //     userLookup[userEmail] = user.id
  //     PROPERTY_STORE.setProperty('userLookup', JSON.stringify(userLookup))
  //   }
  // }

  // User doesn't exist or is not active:
  if (!(user?.active))
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
  // Everyone can view their own leads and loans
  let views = [USER_VIEW.LEADS, USER_VIEW.LOANS]

  if (userRoles.admin || userRoles.owner)
  {
    views.push(USER_VIEW.ADMIN)
  }
  if (userRoles.adminAssistant)
  {
    views.push(USER_VIEW.ASSISTANT_ADMIN)
  }
  if (userRoles.owner || userRoles.developer)
  {
    views.push(USER_VIEW.PAYROLL)
  }

  return views
}

/**
 * Determine whether the user has permission to view this page.
 * @param {string} page As passed in url
 * @param {string[]} userViews
 * @returns {boolean} Whether the user has permission to view this page
 */
function validateUserViewPermission(page, userViews, urlParams)
{
  // Everyone can see their own payroll page
  if (/^payroll\/record/.test(page)) return true;
  // Client portal "report" view is only for admin
  if (/^leads/.test(page) && /report/.test(urlParams.leadType)) return userViews.includes(USER_VIEW.ADMIN) || userViews.includes(USER_VIEW.ASSISTANT_ADMIN)
  if (/^leads/.test(page)) return userViews.includes(USER_VIEW.LEADS)
  if (/^payroll/.test(page)) return userViews.includes(USER_VIEW.PAYROLL)
  if (/^loans/.test(page)) return userViews.includes(USER_VIEW.LOANS)
  // Assistant admin can view lead allocations but not other admin pages
  if (/allocation/.test(page)) return userViews.includes(USER_VIEW.ADMIN) || userViews.includes(USER_VIEW.ASSISTANT_ADMIN)
  if (/^admin/.test(page)) return userViews.includes(USER_VIEW.ADMIN)
  if (/^settings/.test(page)) return userViews.includes(USER_VIEW.ADMIN) || userViews.includes(USER_VIEW.ASSISTANT_ADMIN)
  // None of the above?  (Like home page) everyone can view.
  return true;
}

