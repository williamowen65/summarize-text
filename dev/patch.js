
// 9.5.23 Patch data to fix a bug in balance carry overs on payroll
function patchBalanceCarryOver()
{
  const payrollData = FirebaseDatabase.getList('payrollUsers')
  const updates = {}
  let count = 0
  payrollData.forEach(payRoll =>
  {
    if (payRoll.payments)
    {
      let carryOver = 0
      // Keys are pay dates
      Object.keys(payRoll.payments)
        .sort()
        .forEach(paydate =>
        {
          // We're not interested in previous years
          if (paydate < '2023') return
          const payment = payRoll.payments[paydate]
          carryOver += payment.balanceCarryOver || 0
          if (carryOver != payment.balanceCarryOver)
          {
            updates[`${payRoll.fbKey}/payments/${paydate}/balanceCarryOver`] = carryOver
            console.log("Updating %s/%s to %s", payRoll.fbKey, paydate, carryOver)
            count++
          }
        })
    }
  })
  console.log("Updating %s payments");
  FirebaseDatabase.update("payrollUsers", updates)
}
// 8.25.23 Change on hold substatus to its own status
function addOnHoldStatus()
{
  const leadsOnHold = FirebaseDatabase.get('leads', {
    orderByChild: 'substatus',
    equalTo: 'LBN3K3FC'
  })
  console.log("Found %s leads on hold", Object.keys(leadsOnHold).length)
  Object.entries(leadsOnHold).forEach(([id, lead]) =>
  {
    FirebaseDatabase.update(`leads/${id}`, {
      'substatus': 'onHold',
      'status': 'onHold'
    })
    console.log("Updated lead %s", id)
  })
}

function patchSetInactive()
{
  const leads = FirebaseDatabase.getList('leads');
  const borrowersById = FirebaseDatabase.get('borrowers');
  const leadsByBorrower = hashObjectsManyToOne(leads, 'borrowerId');
  const refiLeads = Object.values(leadsByBorrower)
    .filter(x => x.length > 1)
  console.log("Found %s borrowers with multiple leads", refiLeads.length);
  const updates = {}
  refiLeads.forEach(borrowerLeads =>
  {
    const mostRecent = hasMaxOf(borrowerLeads, 'acquisitionDate')
    if (borrowerLeads
      .filter(x => x.acquisitionDate >= mostRecent.acquisitionDate)
      .length > 1)
    {
      console.warn("For borrower %s, multiple most recent leads: ",
        mostRecent.borrowerId, borrowersById[mostRecent.borrowerId])
    } else
    {
      console.log(borrowersById[mostRecent.borrowerId])
    }
    borrowerLeads.forEach(lead =>
    {
      if (lead.acquisitionDate < mostRecent.acquisitionDate)
      {
        updates[`${lead.leadId}/inactive`] = true
      }
    })
  });
  console.log("Setting inactive on %s leads", Object.keys(updates).length);
  FirebaseDatabase.update("leads", updates)
}

function patchFindDuplicateBorrowers()
{
  let borrowers = FirebaseDatabase.getList('borrowers')
  const props = ['email', 'phone', 'address']
  const duplicatesByProp = {}
  props.forEach(prop =>
  {
    const borrowersByProp = hashObjectsManyToOne(borrowers, prop)
    duplicatesByProp[prop] = Object.fromEntries(
      Object.entries(borrowersByProp).filter(([k, x]) => x.length > 1)
    )
    console.log("%s duplicates by %s", Object.keys(duplicatesByProp[prop]).length, prop);
  })

  // Consolidate into one list of duplicates
  const otherProps = ['email', 'address']
  let duplicates = Object.values(duplicatesByProp.phone)
  duplicates.forEach(duplicateList =>
  {
    duplicateList.forEach(borrower =>
    {
      otherProps.forEach(prop =>
      {
        if (duplicatesByProp[prop][borrower[prop]])
        {
          duplicateList = duplicateList.concat(duplicatesByProp[prop][borrower[prop]])
          delete duplicatesByProp[prop][borrower[prop]]
        }
      })
    })
  })
  duplicates = duplicates.concat(
    Object.values(duplicatesByProp.email),
    Object.values(duplicatesByProp.address)
  )
  console.log("Consolidated to %s duplicates", duplicates.length);
  console.log(countBy(duplicates, "length"))
  // DriveApp.createFile(
  //   'Duplicate Borrowers.json',
  //   JSON.stringify(duplicates, null, 2),
  //   'application/json'
  // )

  // Mark as duplicates in the database
  const updates = Object.fromEntries(duplicates.flat()
    .map(borrower => ([`${borrower.fbKey}/duplicate`, true])))
  FirebaseDatabase.update('borrowers', updates)
  return

  const priorityMerges = duplicates.filter(dupeList =>
  {
    return dupeList.find(x => x.rating === 'X') &&
      dupeList.find(x => x.rating !== 'X')
  })
  console.log("%s duplicates should be prioritized", priorityMerges.length)
  DriveApp.createFile(
    'priorityMerges.json',
    JSON.stringify(priorityMerges, null, 2),
    'application/json'
  )
}

function testPatchMerge()
{
  patchMergeDuplicateBorrowers(
    'LC19WQQE',
    'LC19URIV'
  )
}

// Merge duplicate borrowers by removing one and assigning its leads to the other
function patchMergeDuplicateBorrowers(keeperId, duplicateId)
{
  const leads = FirebaseDatabase.get('leads', {
    orderByChild: 'borrowerId',
    equalTo: duplicateId
  })
  console.log("Found %s leads for borrower id %s", Object.keys(leads).length, duplicateId)
  const updates = {}
  for (let id in leads)
  {
    updates[id + `/borrowerId`] = keeperId
  }
  FirebaseDatabase.update('leads', updates)
  FirebaseDatabase.remove('borrowers/' + duplicateId)
}


// 7.21.23 The update home values function failed while adding profile subscriptions, so we do that here
function patchKlaviyoSubscriptions()
{
  let profiles = Klaviyo.getProfiles()
    .filter(p => p.attributes.subscriptions?.email?.marketing?.consent !== 'SUBSCRIBED')

  console.log("%s profiles need to be subscribed", profiles.length)
  Klaviyo.subscribeProfiles(profiles.map(p => ({
    profile_id: p.id,
    email: p.attributes.email
  })))
}

// 7.17.23 Set current index to current rate, per the specs in HCS-282 and HCS-246
function patchCurrentInterestRate()
{
  const leads = FirebaseDatabase.getList('leads')
  const updates = {}
  let noRateCount = 0
  let hasIndex = 0
  leads.forEach(lead =>
  {
    if (lead.currentLoan?.index)
    {
      console.warn("Lead %s has index %s and rate %s",
        lead.leadId, lead.currentLoan?.index, lead.rate);
      hasIndex++;
    }
    else if (lead.rate)
    {
      updates[`${lead.leadId}/currentLoan/index`] = lead.rate
    } else
    {
      // console.warn("No rate on lead %s", lead.leadId)
      noRateCount++
    }
  })
  FirebaseDatabase.update("leads", updates)
  console.log("Updated %s leads", Object.keys(updates).length);
  console.log("Has index: %s", hasIndex);
  console.log("No rate: %s", noRateCount)
}

// one time patch for updating schema
function patchScoreNotes()
{
  const fileSubmissionScores = FirebaseDatabase.get("fileSubmissionScores")
  let count = 0

  Object.entries(fileSubmissionScores).forEach(([LOId, loanOfficerEntries]) =>
  {
    Object.entries(loanOfficerEntries).forEach(([borrowerId, borrowerRatingData]) =>
    {
      if (!borrowerRatingData.hasOwnProperty('file') && !borrowerRatingData.hasOwnProperty('submission'))
      {
        console.log("borrowerRatingData", { LOId, borrowerRatingData })
        count++
        FirebaseDatabase.update('fileSubmissionScores', {
          [`${LOId}/${borrowerId}`]: {
            submission: borrowerRatingData
          }
        })
      }
    })
  })
  console.log('Number of scores updated with patch  -- %s', count)
}


function patchLeadInterestsRate()
{
  const leads = FirebaseDatabase.getList('leads')
  const updates = {}
  let noRateCount = 0
  leads.forEach(lead =>
  {
    if (lead.rate)
    {
      updates[`${lead.leadId}/interestRate/initial/index`] = lead.rate
    } else
    {
      console.warn("No rate on lead %s", lead.leadId)
      noRateCount++
    }
  })
  FirebaseDatabase.update("leads", updates)
  console.log("Updated %s leads", Object.keys(updates).length);
  console.log("No rate: %s", noRateCount)
}

function patchSyncedLoanFigures()
{

  const loans = FirebaseDatabase.getList('loans')
  let counts = {
    loans: 0,
    figures: 0,
    no: 0
  }

  loans.forEach(loan =>
  {
    const updates = {}
    if (loan.loanFigures) loan.loanFigures.forEach((figure, index) =>
    {
      if (figure.figure === "Expected Rate")
      {
        updates[`${index}/leadProperty`] = 'interestRate.expected.totalRate'
      }
      if (figure.figure === 'Margin')
      {
        updates[`${index}/leadProperty`] = 'interestRate.initial.margin'
      }
      if (figure.figure === 'Principal Limit')
      {
        updates[`${index}/leadProperty`] = 'principalLimit'
      }
    })
    if (Object.keys(updates).length > 0)
    {
      counts.loans++
      counts.figures += Object.keys(updates).length
      console.log("Updates for loan %s: %s", loan.loanId, JSON.stringify(updates));
      FirebaseDatabase.update(
        `loans/${loan.loanId}/loanFigures`,
        updates
      )
    } else
    {
      console.warn("No updates for loan %s", loan.loanId)
      console.log(JSON.stringify(loan))
      counts.no++
    }
  })
  console.log(counts)
}

// 5.10.23 Adjust for change in subject property address
function patchSubjectPropertyAddress()
{
  const loans = FirebaseDatabase.getList('loans')
  // const leads = FirebaseDatabase.get('leads')
  let counts = {
    borrowerAddress: 0,
    subjectProperty: 0,
    noAddress: 0
  }
  loans.forEach(loan =>
  {
    // let lead = leads[loan.fbKey]

    if (loan.subjectPropertyIsBorrowerAddress)
    {
      let lead = FirebaseDatabase.get(`leads/${loan.fbKey}`)
      let borrower = FirebaseDatabase.get(`borrowers/${lead.borrowerId}`)
      let property = {
        address: borrower.address,
        city: borrower.city,
        state: borrower.state,
        zip: borrower.zip
      }
      console.log("For lead %s property is %s", loan.fbKey, JSON.stringify(property))
      FirebaseDatabase.set(
        `leads/${loan.fbKey}/property`,
        property
      )
      counts.borrowerAddress++
    } else if (loan.subjectPropertyAddress)
    {
      let property = {
        address: loan.subjectPropertyAddress,
      }
      console.log("For lead %s property is %s", loan.fbKey, JSON.stringify(property))
      FirebaseDatabase.set(
        `leads/${loan.fbKey}/property`,
        property
      )
      counts.subjectProperty++
    } else
    {
      counts.noAddress++
    }
  })
  console.log(counts)
}

//  5.9.23 Update fields that we are syncing
function patchSyncedPurpose()
{
  const loanPurposeMap = {
    'Refinance': 'L5VKYIHY',
    'Purchase': "L5VKYIDG",
    'H2H': 'L5VKYIMC'
  };
  const leadPurposeMap = {
    'L5VKYIHY': 'Refinance',
    "L5VKYIDG": 'Purchase',
    'L5VKYIMC': 'H2H'
  };
  const loans = FirebaseDatabase.getList('loans')
  const leads = FirebaseDatabase.get('leads')
  let counts = {
    leads: 0,
    loans: 0
  }
  loans.forEach(loan =>
  {
    let lead = leads[loan.fbKey]
    if (!lead)
    {
      console.error("No lead for loan %s", loan.loanId)
      return
    }

    if (!lead.purpose && loan.loanPurpose)
    {
      console.log("Updating purpose on lead %s (%s)", loan.fbKey, loan.loanPurpose)
      const leadPurpose = loanPurposeMap[loan.loanPurpose]
      if (leadPurpose)
      {
        FirebaseDatabase.set(`leads/${loan.fbKey}/purpose`, leadPurpose)
        counts.leads++
      } else
      {
        console.error("No map for loanPurpose %s", loan.loanPurpose)
      }
    }

    if (lead.purpose && !loan.loanPurpose)
    {
      console.log("Updating purpose on loan %s (%s)", loan.fbKey, lead.purpose)
      const loanPurpose = leadPurposeMap[lead.purpose]
      if (loanPurpose)
      {
        FirebaseDatabase.set(`loans/${loan.fbKey}/loanPurpose`, loanPurpose)
        counts.loans++
      } else
      {
        console.error("No map for purpose %s", lead.purpose)
      }
    }

  })
  console.log(counts)
}

//  5.20.23 Updating loan to use keys from options/purpose/options
function patchLoanPurposeToUseKeys()
{
  const loanPurposeMap = {
    'Refinance': 'L5VKYIHY',
    'Refi': 'L5VKYIHY',
    'Purchase': "L5VKYIDG",
    'Purch.': "L5VKYIDG",
    'H2H': 'L5VKYIMC',
    "Cash Out": "L5VKYIZG",
    "L5VKYIZG": "L5VKYIZG"
  };

  const loans = FirebaseDatabase.get('loans')
  console.log(Object.keys(hashObjects(Object.values(loans), 'loanPurpose')))
  let count = 0;
  Object.entries(loans).forEach(([id, loanInfo]) =>
  {
    const loanPurpose = loanInfo.loanPurpose
    if (!loanPurpose) return;
    const newKeyValue = loanPurposeMap[loanPurpose]
    if (newKeyValue)
    {
      count++
      FirebaseDatabase.set(`loans/${id}/loanPurpose`, newKeyValue)
    } else
    {
      throw new Error("Unknown loan purpose: " + loanPurpose)
    }
  })
  console.log("Updated %s loans", count)

}

//  5.9.23 Update fields that we are syncing
function patchSyncedLoanFields()
{
  const fields = {
    'previousClose': 'previousClose',
    "originalHECMClosing": "originalHECMClosing",
    "previousValue": "previousValue",
    "currentMargin": "currentMargin",
    "currentRate": "currentRate",
    "currentMIPRate": "currentMIPRate",
    "currentPL": "currentPL",
    "currentLOCAvail": "currentLOCAvail",
    "currentLESAAmount": "currentLESAAmount",
  }
  const loans = FirebaseDatabase.getList('loans')
  const leads = FirebaseDatabase.get('leads')
  let count = 0, leadCount = 0
  loans.forEach(loan =>
  {
    let lead = leads[loan.fbKey]
    if (!lead)
    {
      console.error("No lead for loan %s", loan.loanId)
      return
    }
    let updated = false
    Object.keys(fields).forEach(prop =>
    {
      if (loan[prop] && !lead[prop])
      {
        console.log("Updating %s on lead %s (%s)", prop, loan.fbKey, loan[prop])
        FirebaseDatabase.set(`leads/${loan.fbKey}/${prop}`, loan[prop])
        count++
        updated = true;
      }
    })
    if (updated)
    {
      leadCount++;
    }
  })
  console.log("Updated %s properties on %s leads", count, leadCount)
}

// 5.1.23 Patch to fix a bug caused 4.16.23 in an update to payroll;
// The system was creating a new compensation rule each time we loaded the employees pay sheet;
// This patch removes all rules since that date
function patchPayrollUserRules()
{
  const threshold = '2023-04-16'
  const users = FirebaseDatabase.getList('payrollUsers')
  const removals = {}
  const counts = {
    remove: 0,
    keep: 0
  }
  users.forEach(user =>
  {
    if (user.rules)
    {
      Object.entries(user.rules).forEach(([id, rule]) =>
      {
        if (rule.effectiveDate >= threshold)
        {
          console.log("Marking for deletion: rule %s effective %s", id, rule.effectiveDate)
          // removals[`${user.fbKey}/rules/${id}`] = null
          FirebaseDatabase.remove(`payrollUsers/${user.fbKey}/rules/${id}`)
          counts.remove++
        } else
        {
          counts.keep++
        }
      })
    }
  })
  console.log(counts)
  // console.log(removals)
  // FirebaseDatabase.update('payrollUsers', removals)
}


// 5.3.23 We ended up with invalid loans when sinking fields; delete these so they can be rebuilt
function patchEmptyLoans()
{
  let emptyLoans = FirebaseDatabase.getList('loans', {
    orderByChild: 'templateType',
    endAt: ''
  })
    .filter(loan => !loan.loanId)
  console.log("Found %s empty loans", emptyLoans.length)
  emptyLoans.forEach(loan =>
  {
    console.log(JSON.stringify(loan))
    // FirebaseDatabase.remove(`loans/${loan.fbKey}`)
  })
}

// 4.27.23 We made creditPulled a required boolean field, so we need to reset all false values to null.
function patchCreditPulled()
{
  let leads = FirebaseDatabase.get('leads'
    // , {
    // orderByChild: 'creditPulled',
    // equalTo: false
    // }
  )
  console.log(Object.keys(leads).length)
  let counts = {
    'false': 0,
    'falseString': 0,
    'other': 0
  }
  Object.values(leads).forEach(lead =>
  {
    if (lead.creditPulled === false) counts.false++
    else if (lead.creditPulled === 'false') counts.falseString++
    else counts.other++

  })
  console.log(counts)

  console.log("Found %s leads", Object.keys(leads).length)
  let activeLeads = Object.fromEntries(Object.entries(leads)
    .filter(([id, lead]) =>
      lead.status !== StatusId.DEAD && lead.status !== StatusId.WATCH
      && (lead.creditPulled === false || lead.creditPulled === 'false')
    )
  )
  console.log("Found %s active leads to be patched", Object.keys(activeLeads).length)

  let updates = Object.fromEntries(
    Object.entries(activeLeads)
      .map(([id, lead]) =>
      {
        return [`${id}/creditPulled`, null]
      })
  )
  console.log(JSON.stringify(updates))

  FirebaseDatabase.update('leads', updates)

}

// 4.16.23 Move pay role to its own collection instead of on the user object
function patchMovePayroll()
{
  let users = FirebaseDatabase.get('users')
  let payroll = {}
  for (let userId in users)
  {
    if (users[userId].payroll)
    {
      payroll[userId] = {}
      payroll[userId].payments = users[userId].payroll.payments
      payroll[userId].rules = users[userId].payroll.rules
    }
  }
  FirebaseDatabase.set('payrollUsers', payroll)
  console.log("Created %s payroll objects", Object.keys(payroll).length)

  // Remove from user object
  for (let userId in users)
  {
    if (users[userId].payroll)
    {
      FirebaseDatabase.remove(`users/${userId}/payroll/payments`)
      FirebaseDatabase.remove(`users/${userId}/payroll/rules`)
      console.log("Removed payroll from user %s", userId)
    }
  }
}

// 3.20.23 Filter referral partners out of business developer commissions
function patchBusinessDeveloperReferralPartners()
{
  let commissions = FirebaseDatabase.get('/users/L5VKZ07N/payroll/payments/2023-03-24/commissions/businessDeveloper')
  commissions = Object.fromEntries(Object.entries(commissions).filter(([id, commission]) =>
  {
    let lead = FirebaseDatabase.get('leads/' + commission.loanId)
    return lead.status !== StatusId.PARTNER
  }))
  console.log("Filtered to %s entries", Object.keys(commissions).length)
  FirebaseDatabase.set('/users/L5VKZ07N/payroll/payments/2023-03-24/commissions/businessDeveloper', commissions)
}

// 3.5.23 Patch to fix processor commissions, as they are being stored as strings
// and currency values are not stored as cents
function patchProcessorCommissions()
{
  let users = FirebaseDatabase.get('users')
  console.log("%s users", Object.keys(users).length)
  let count = 0
  Object.entries(users).forEach(([userId, user]) =>
  {
    if (!(user.payroll?.rules)) return
    Object.entries(user.payroll.rules).forEach(([ruleId, rule]) =>
    {
      if (!rule.commissions?.processor?.turnTime) return
      Object.entries(rule.commissions.processor.turnTime).forEach(([levelId, level]) =>
      {
        if ('string' === typeof level.value)
        {
          console.log("Updating processor turntime level %s", JSON.stringify(level))
          level.min = parseInt(level.min, 10)
          level.max = parseInt(level.max, 10)
          level.value = parseInt(level.value, 10) * 100
          FirebaseDatabase.set(`users/${userId}/payroll/rules/${ruleId}/commissions/processor/turnTime/${levelId}`, level)
          count++
        }
      })
    })
  })
  console.log("Made %s updates", count)
}
// 2.13.23 Changes to all loan officer commission tiers
function patchLoTiers()
{
  let users = FirebaseDatabase.get('users')
  console.log("%s users", Object.keys(users).length)
  let count = 0
  Object.entries(users).forEach(([userId, user]) =>
  {
    if (!(user.active && user.payroll?.active && user.roles?.loanOfficer)) return
    const latestRule = getLatestCompRule(user)
    if (latestRule?.commissions?.loanOfficer)
    {
      const newRule = Object.assign(latestRule, {
        effectiveDate: '2023-02-13',
        ruleId: null
      })

      newRule.commissions.loanOfficer.company.reverseFundedUnits = [
        {
          "id": 1,
          "max": "4",
          "min": "1",
          "value": "20"
        },
        {
          "id": 2,
          "max": 7,
          "min": 5,
          "value": 25
        },
        {
          "id": 3,
          "max": 1000000000000,
          "min": 8,
          "value": 30
        }
      ];
      newRule.commissions.loanOfficer.selfGen.reverseFundedUnits = [
        {
          "id": 2,
          "max": "7",
          "min": "1",
          "value": "60"
        },
        {
          "id": 3,
          "max": 1000000000000,
          "min": 8,
          "value": 65
        }
      ]
      FirebaseDatabase.push(`users/${userId}/payroll/rules`, newRule)
      console.log("Updated LO commissions for %s %s", user.name, userId)
      count++
    }
  })
  console.log("Made %s updates", count)
}

function patchLenderOptions()
{
  const lendersById = FirebaseDatabase.get('partners/lender')
  const leads = FirebaseDatabase.get('leads')
  const lenderLeads = Object.values(leads).filter(x => x.lender)
  let counts = lenderLeads
    .reduce((count, lead) =>
    {
      if (!count.hasOwnProperty(lead.lender)) count[lead.lender] = 0;
      count[lead.lender]++;
      if (lead.lender === 'L9W6XCHT') console.log(lead.leadId)
      return count;
    }, {})
  console.log(JSON.stringify(
    counts, null, 2))

  console.log(JSON.stringify(
    Object.keys(counts).map(k => `${lendersById[k].company}: ${counts[k]}`)
    , null, 2))

  const lenderMap = {
    L9VUI3EZ: 'L9W6V7JF', // Simple Rev
    L9W6V132: 'L9W6V7JF', // SR
    LBYFTOYG: 'L9W6V7JF', // simple
    LBYFTWRP: 'L9W6V7JF', // Simple
    L9W71E24: null, // r
    L9W6XCHT: 'L9VT7YRA', // liberty
    L9W7IU5E: null, // " "
    L9W7EG1S: 'L6JTMZN8', // lbf
  }

  lenderLeads.forEach(lead =>
  {
    if (lenderMap.hasOwnProperty(lead.lender))
    {
      FirebaseDatabase.set(`leads/${lead.leadId}/lenderImported`, lendersById[lead.lender].company)
      if (lenderMap[lead.lender] === null)
        FirebaseDatabase.remove(`leads/${lead.leadId}/lender`)
      else FirebaseDatabase.set(`leads/${lead.leadId}/lender`, lenderMap[lead.lender])
    }
  })
}

function patchPayrollActive()
{
  const users = FirebaseDatabase.get('users')
  for (let id in users)
  {
    if (users[id].payroll)
    {
      FirebaseDatabase.set(`users/${id}/payroll/active`, true)
    }
  }
}

function patchAddBorrower()
{
  console.log(
    FirebaseDatabase.push('borrowers', {
      names: [{
        first: 'update borrower details)',
        last: '(please'
      }]
    })
  )
}

// Rather than a single text field, we will now treat key file notes like communication log
function patchChangeKeyNotesToList()
{
  const loans = FirebaseDatabase.get('loans')
  Object.values(loans).forEach((loan) =>
  {

    if (loan.keyFileNotes && 'string' === typeof loan.keyFileNotes)
    {
      const key = getUid()
      const update = {}
      update[key] = {
        "note": loan.keyFileNotes,
      }
      FirebaseDatabase.set(`loans/${loan.loanId}/keyFileNotes`,
        update)
      console.log("Updated loan %s key file notes", loan.loanId)
    }

  })
}


function patchFindLostLeads()
{
  const leads = FirebaseDatabase.get('leads')
  Object.entries(leads).forEach(([k, v]) =>
  {
    if ("object" !== typeof v)
    {
      console.log(k)
    }
  })

}

// 12.26.22 I forgot to include the "calculates" field on loan figures when importing borrower tracker
function patchBorrowerTrackerImport01()
{
  const loans = FirebaseDatabase.getList('loans')
  const borrowerTrackerTemplates = getBorrowerTrackerTemplates()
  const loanFiguresByTemplateAndFigure = {}
  for (let templateType in borrowerTrackerTemplates)
  {
    loanFiguresByTemplateAndFigure[templateType] = hashObjects(
      borrowerTrackerTemplates[templateType].defaults.loanFigures,
      'figure'
    )
  }
  loans.forEach(loan =>
  {
    const template = borrowerTrackerTemplates[loan.templateType]
    if (!template)
    {
      console.error("No template for loan %s", loan.loanId)
      return
    }

    loan.loanFigures.forEach((figure, index) =>
    {
      const templateDefault = loanFiguresByTemplateAndFigure[loan.templateType][figure.figure]
      // console.log("For %s, defaults are %s", figure.figure, JSON.stringify(templateDefault))
      if (templateDefault?.name
        || templateDefault?.leadProperty
        || templateDefault?.calculates
        || templateDefault?.calculated)
      {
        FirebaseDatabase.set(
          `loans/${loan.loanId}/loanFigures/${index}`,
          Object.assign(templateDefault, figure)
        )
        console.log("Updated figure %s on loan %s", figure.figure, loan.loanId);
      }
    })
  })
}

// 05-21-23, referral partners internal contact from {string} ie "Loan Officer"
// to internalContact {object} with loanOfficer and businessDeveloper
function patchInternalContact()
{
  const referralPartners = FirebaseDatabase.get('referralPartners')
  let counts = {
    'update': 0,
    'noContact': 0
  }
  Object.entries(referralPartners).forEach(([id, referralPartner]) =>
  {
    const lo = referralPartner.internalContact
    if (lo)
    {
      FirebaseDatabase.update(`referralPartners/${id}`, {
        internalContact: {
          loanOfficer: lo,
          // businessDeveloper: ""
        }
      })
      counts.update++
    } else
    {
      counts.noContact++
    }
  })
  console.log(counts)
}

function patchCheckInternalContact()
{
  const referralPartners = FirebaseDatabase.get('referralPartners')
  let counts = {
    'update': 0,
    'no': 0
  }
  Object.entries(referralPartners).forEach(([id, referralPartner]) =>
  {
    if (referralPartner.internalContact?.loanOfficer?.loanOfficer)
    {
      FirebaseDatabase.update(`referralPartners/${id}`, {
        internalContact: {
          loanOfficer: referralPartner.internalContact?.loanOfficer?.loanOfficer
          // businessDeveloper: ""
        }
      })
      console.log(id)
      counts.update++
    } else
    {
      counts.no++
    }
  })
  console.log(counts)
}