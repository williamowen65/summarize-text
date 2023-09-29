
function testInstanceOf()
{
  const folder = DriveApp.getRootFolder()
  console.log(folder instanceof DriveApp.Folder)
}

function testUrlFetchRateLimits()
{
  // According to this SO post, rate limit is 3000 calls per minute
  // https://stackoverflow.com/questions/30157226
  // but by experimentation, it seems that fetchAll has tighter limits; 
  // e.g. even 250 simultaneous requests of 1.2k each, triggered a rate limit error.
  const url = 'https://www.gstatic.com/ipranges/goog.txt'
  const requests = Array(3000).fill({
    url: url
  })
  // const responses = UrlFetchApp.fetchAll(requests)
  const responses = FetchTools.backoffBatches(requests, {
    batchSize: 250
  })
  console.log(responses[0].getContentText())
  console.log(responses[0].getContent().length)
  // requests.forEach((request, index) =>
  // {
  //   const response = UrlFetchApp.fetch(request.url)
  //   console.log('%s: %s', index, response.getContent().length)
  // })
}

function testLogOfLoanPurpose()
{
  const loans = FirebaseDatabase.get('loans')
  const data = Object.entries(loans).map(([id, loanInfo]) =>
  {
    return [loanInfo.loanPurpose, id]
  })
  console.log(data)
}

function testGetList()
{

  let leads = FirebaseDatabase.getList("leads", {
    orderByChild: 'status',
    equalTo: 'L5VKYDRL'
  })

  console.log(leads)

}

function testGetBorrowers()
{
  const borrowers = FirebaseDatabase.get('borrowers')
  console.log(borrowers)
}

function testManagerRole()
{
  console.log(
    getAssigneeIdByRole(null, 'processorManager', FirebaseDatabase.get('users'))
  )
}

function testHandlebarsNumbers()
{
  registerHandlebarsHelpers();
  const exp = Handlebars.compile('{{x}}')({ x: 5 });
  console.log(exp);
  console.log(typeof exp)
}

function testBirthdays()
{
  let leads = getLeadsJoinBorrowers()
    .filter(x => /03-16/.test(x.borrower?.names?.[0]?.dob)
      || /03-16/.test(x.borrower?.names?.[1]?.dob)
    )
  console.log(leads.length)
  console.log(JSON.stringify(leads.map(x => x.borrower), null, 2))
}

function testRevenueTotals()
{
  const leads = FirebaseDatabase.get('leads')
  let start = '2021-01-01 00:00:00'
  let end = '2021-12-31 23:59:59'
  const fundings = Object.values(leads)
    .filter(x =>
      x.status === 'L5VKYDRL'
      && x.fundedDate
      && x.fundedDate >= start
      && x.fundedDate <= end)

  // console.log("%s leads in state", stateLeads.length)

  console.log(JSON.stringify(countBy(fundings, "state"), null, 2))
  console.log(JSON.stringify(sumBy(fundings, "loanRevenue", "state"), null, 2))

}

function testPaydate()
{
  console.log(getNextPayday('2023-01-09'))
  console.log(getPayDate('2023-01-09'))
}
function testGenerateUids()
{
  for (i = 0; i < 100; i++)
  {
    console.log(getUid())
  }
}

function testSetSampleTasks()
{
  const sampleTasks = [
    {
      "status": 'active',
      "type": "sample",
      "created": '2022-12-14 14:32:12',
      "priority": 'High',
      "task": 'Sample to-do item 01',
      "lead": '04658ca8-e418-425c-a0f1-aac91abc8922',
      "assignee": 'L5VKYXK3',
      "deferrable": {
        "maxTime": '7',
        "timeUnit": 'day',
      }
    },

    {
      "status": 'active',
      "type": "sample",
      "created": '2022-12-14 14:32:12',
      "priority": 'Medium',
      "task": 'Sample to-do item 02',
      "lead": '5fff048a-e279-4c79-b2cb-25f6d8ab6b6f',
      "assignee": 'L5VKYXK3',
      "deferrable": {
        "maxTime": '7',
        "timeUnit": 'day',
      }
    },
    {
      "status": 'active',
      "type": "sample",
      "created": '2022-12-14 14:32:12',
      "priority": 'Low',
      "task": 'Sample to-do item 03',
      "lead": '5764b8a8-7ff1-4b03-a145-6e95ad8b20a0',
      "assignee": 'L5VKYXK3',
      "deferrable": {
        "maxTime": '7',
        "timeUnit": 'day',
      }
    },
    {
      "status": 'active',
      "type": "sample",
      "created": '2022-12-14 14:32:12',
      "priority": 'High',
      "task": 'Sample to-do item 04',
      "lead": '3316419a-4904-4a47-95b4-9e8dd2a40161',
      "assignee": 'L5VKYXK3',
      "deferrable": {
        "maxTime": '7',
        "timeUnit": 'day',
      }
    },
    {
      "status": 'deferred',
      "type": "sample",
      "created": '2022-12-14 14:32:12',
      "priority": 'Medium',
      "task": 'Sample to-do item 05',
      "lead": '32389109-fd03-4f48-8061-908fa9dd9b79',
      "assignee": 'L5VKYXK3',
      "deferrable": {
        "maxTime": '7',
        "timeUnit": 'day',
      }
    },
    {
      "status": 'active',
      "type": "sample",
      "created": '2022-12-14 14:32:12',
      "priority": 'Medium',
      "task": 'Sample to-do item 06',
      "lead": '2cfd63bc-5613-4536-94b9-5fff33d1ed62',
      "assignee": 'L5VKYXK3',
      "deferrable": {
        "maxTime": '7',
        "timeUnit": 'day',
      }
    },
    {
      "status": 'closed',
      "type": "sample",
      "created": '2022-12-14 14:32:12',
      "priority": 'High',
      "task": 'Sample to-do item 07',
      "lead": '2342d862-5cc1-4e1e-b120-1ba0892aade1',
      "assignee": 'L5VKYXK3',
      "deferrable": {
        "maxTime": '7',
        "timeUnit": 'day',
      }
    },
    {
      "status": 'closed',
      "type": "sample",
      "created": '2022-12-14 14:32:12',
      "priority": 'Low',
      "task": 'Sample to-do item 08',
      "lead": '230d89e0-69b0-4494-aeef-f28aba15afee',
      "assignee": 'L5VKYXK3',
      "deferrable": {
        "maxTime": '7',
        "timeUnit": 'day',
      }
    },
    {
      "status": 'deferred',
      "type": "sample",
      "created": '2022-12-14 14:32:12',
      "priority": 'Low',
      "task": 'Sample to-do item 09',
      "lead": '22135113-a51f-4b14-8cd3-435a700ad98d',
      "assignee": 'L5VKYXK3',
      "deferrable": {
        "maxTime": '7',
        "timeUnit": 'day',
      }
    },
  ]
  FirebaseDatabase.set('tasks', sampleTasks)
}

function restoreTestData()
{
  // FirebaseDatabase.set('loans/test', FirebaseDatabase.get('loans/test2'))
  FirebaseDatabase.set('leads/test', FirebaseDatabase.get('leads/test2'))
}
function testFirstPayDateOfMonth()
{
  console.log(isFirstPaydateOfMonth('2022-03-01'))
}

function testSetSamplePayments()
{
  let payment = {
    "paydate": '2022-09-23',
    "regularHours": 50,
    "regularPay": 75000,
    "regularPayRate": 1500,
    "overtimeHours": 10,
    "overtimePay": 20000,
    "overtimePayRate": 2000,
    "salary": 500000,
    // "commissions": {
    //   "loanOfficer": [
    //     {
    //       "loanId": { type: "key" },
    //       "loanDirection": { type: "enum" }, // Forward or Reverse
    //       "loanSource": { type: "enum" }, // Company or Self Gen
    //       "adjustmentType": { type: "enum" }, // none or tiered (tiered comp for previous period)
    //       "rate": { type: "integer" },
    //       "rateType": { type: "enum" }, // Fixed, percent, or bps
    //       "amount": { type: "currency" },
    //     }
    //   ],
    //   "processor": [
    //     {
    //       "loanId": { type: "key" },
    //       "rate": { type: "currency" },
    //       "rateType": { type: "enum" }, // Always fixed for processor
    //       "amount": { type: "currency" },
    //     }
    //   ],
    //   "pipelineManager": [
    //     {
    //       "loanId": { type: "key" },
    //       "rate": { type: "currency" },
    //       "rateType": { type: "enum" }, // Always fixed for pm
    //       "amount": { type: "currency" },
    //     }
    //   ],
    //   "businessDeveloper": [
    //     {
    //       "loanId": { type: "key" },
    //       "rate": { type: "currency" },
    //       "rateType": { type: "enum" }, // generated or funded
    //       "amount": { type: "currency" },
    //     }
    //   ],
    //   "other": [
    //     {
    //       "amount": { type: "currency" },
    //       "description": { type: "string" },
    //     }
    //   ],
    //   "splits": [
    //     {
    //       "amount": { type: "currency" },
    //       "description": { type: "string" },
    //     }
    //   ],
    // },
    // "volumeBonus": {
    //   // TODO
    // },
    "otherBonus": {
      "amount": 55000,
      "description": "Bonus for testing",
    },
    // "assistantWages": {
    //   "amount": { type: "currency" },
    //   "assistant": { type: "user" },
    // },
    // "tcExpenses": [
    //   {
    //     "amount": { type: "currency" },
    //     "loanId": { type: "key" },
    //   }
    // ],
    // "expenses": {
    //   "amount": { type: "currency" },
    //   "description": { type: "string" },
    // },
    // "totalWages": { type: "currency" },
    // "reimbursedExpenses": {
    //   "amount": { type: "currency" },
    //   "description": { type: "string" },
    // },
    // "totalPaid": { type: "currency" },
    // "balanceCarryOver": { type: "currency" },
    "notes": "Testing notes",
    // "vacationDaysTaken": { type: "integer" },
    // "sickDaysTaken": { type: "integer" },
  }

  FirebaseDatabase.set('users/L5VKYXR4/payroll/payments/test002', payment)
}

function backupTestData()
{
  const loan = FirebaseDatabase.get('loans/test')
  const lead = FirebaseDatabase.get('leads/test')
  const folder = DriveApp.getFolderById('147d6Msuq16O7CLcLeChy2Si_y3nu4ra8')
  console.log(folder.getName())
  folder.createFile(`test-lead-${Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd')}.json`,
    JSON.stringify(lead, null, 2),
    'application/json'
  )
  folder.createFile(`test-loan-${Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd')}.json`,
    JSON.stringify(loan, null, 2),
    'application/json'
  )
  FirebaseDatabase.set('loans/test2', loan)
  FirebaseDatabase.set('leads/test2', lead)
}

function testSetSampleLoanChecklists()
{
  let loanOfficerChecklist = SpreadsheetApp.openById('1_iIJv8K45glHxBqPb-bLsCHdEKZ3JV1T-kkn4KUO7tc')
    .getSheetByName('Trujillo, Margarito')
    .getRange('J2:K17')
    .getDisplayValues()
    .map(row => ({
      status: row[0],
      description: row[1],
      type: 'completeIfYes'
    }))

  FirebaseDatabase.set('loans/test/loanOfficerChecklist', loanOfficerChecklist)
  const processorChecklist = SpreadsheetApp.openById('1_iIJv8K45glHxBqPb-bLsCHdEKZ3JV1T-kkn4KUO7tc')
    .getSheetByName('Trujillo, Margarito')
    .getRange('L2:Q17')
    .getDisplayValues()
    .map(row => ({
      date: row[0],
      status: row[1],
      description: row[2],
      notes: row[3]
    }))
  FirebaseDatabase.set('loans/test/processorChecklist', processorChecklist)

}

function testSetSampleLoanNeeds()
{
  const needsList = [
    { status: 'Y', description: 'Signed Counseling Certificate' },
    { status: 'Y', description: 'Driver\'s License/Birth Cert' },
    { status: 'Y', description: 'SS Card/SS# verification' },
    { status: 'Y', description: 'Current SS Award Letter' },
    { status: 'Y', description: 'Recent Mortgage Statement' },
    { status: 'Y', description: 'Signed Loan Disclosures' },
    { status: 'Y', description: 'Ink Signed Disclosures' },
    { status: 'Y', description: '1099' },
    { status: 'Y', description: 'Daughters address and phone number' },
    { status: 'Y', description: 'LOE bankruptcy' },
    { status: 'Y', description: 'LOE Medical' }]
  FirebaseDatabase.set('loans/test/needs', needsList)
}

function test_createBorrower()
{
  let borrower = {
    names: [{ first: 'Sam', last: 'Sample' }],
    email: 'sam@example.com',
    phone: '55555555555',
    address: '205 Railroad St, Tacoma, WA 12345'
  }
  FirebaseDatabase.set('borrowers/test', borrower)
}


function test_getsampleloanfigures()
{
  const data = SpreadsheetApp.openById('1_iIJv8K45glHxBqPb-bLsCHdEKZ3JV1T-kkn4KUO7tc')
    .getSheetByName('Hahn, Carole')
    .getRange('C17:F33')
    .getDisplayValues()
  const figures = data.map(row =>
  {
    return {
      figure: row[0],
      initial: row[1],
      updated: row[2],
      final: row[3]
    }
  })
  console.log(JSON.stringify(figures, null, 2))
  FirebaseDatabase.set('loans/test/loanFigures', figures)
}

function test_regexParseNote()
{
  const notes = "[3/28- A note. 3/25- Another note. 3/24- More text. 10/19- further notes. [10/18- Some more text.]"
  const pattern = /(?=\d{1,2}\/\d{1,2}[- ]+)/g
  console.log(notes.split(pattern))
}

function test_usersCloud()
{
  console.log(JSON.stringify(FirebaseDatabase.remove('users/-N6tFhkC2rSQIWES5huR')))
}

function testGetOptionId()
{
  var x = getOptionId("N. UT", "state", FirebaseDatabase.get("options"))
  console.log(x)
}

function logUsers()
{
  const users = FirebaseDatabase.get("users")
  console.log(
    Object.keys(users)
      .map(x => { return { id: x, name: users[x].name } })
  );

}
