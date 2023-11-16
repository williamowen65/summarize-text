var FirebaseDatabase = (function (ns)
{
  ns = ns || {}
  var URL = 'https://us-central1-prison-call-review.cloudfunctions.net/query-rtdb';
  // Used to receive the identity token when called via the api executable
  var IDENTITY_TOKEN;

  ns.setIdentityToken = function (token)
  {
    IDENTITY_TOKEN = token
  }
  /**
   * Get data from a path (node) of the firebase realtime database
   */
  ns.get = function (path)
  {
    // There are many pre-req's to this authentication working.  See https://stackoverflow.com/a/61922143/10332984
    if (!path) throw new Error("FirebaseDatabase: path required")
    var url = FetchTools.formQueryUrl(URL, { 'path': encodeURIComponent(path) })

    var response = FetchTools.backoffOne(url, {
      method: "get",
      headers: {
        Authorization: 'Bearer ' + (ScriptApp.getIdentityToken())
      },
      // muteHttpExceptions: true
    });

    // console.log(response.getContentText())
    var result = JSON.parse(response.getContentText());
    // console.log(JSON.stringify(result, null, 2));
    return result
  }

  /**
   * Get data from a path (node) of the firebase realtime database
   */
  ns.getSize = function (path)
  {
    // There are many pre-req's to this authentication working.  See https://stackoverflow.com/a/61922143/10332984
    if (!path) throw new Error("FirebaseDatabase: path required")
    var url = FetchTools.formQueryUrl(URL, { 'size': encodeURIComponent(path) })

    var response = FetchTools.backoffOne(url, {
      method: "get",
      headers: {
        Authorization: 'Bearer ' + (ScriptApp.getIdentityToken())
      },
      // muteHttpExceptions: true
    });

    // console.log(response.getContentText())
    var result = JSON.parse(response.getContentText());
    // console.log(JSON.stringify(result, null, 2));
    return result.size
  }

  // Set the key of each object as a property and return an array
  ns.getList = function (path)
  {
    const dataObject = ns.get(path)
    const list = Object.entries(dataObject)
      .map(([k, v]) => Object.assign({ 'fbKey': k }, v))
    console.log("Found %s objects on path %s", list.length, path)
    return list
  }

  /**
   * Update data in a path (node) of the firebase realtime database, without overwriting other data
 */
  ns.update = function (path, data)
  {
    if (!path) throw new Error("FirebaseDatabase: path required")
    var url = FetchTools.formQueryUrl(URL, { 'path': encodeURIComponent(path) })
    console.log("Payload size is %s", JSON.stringify(data).length)
    var response = FetchTools.backoffOne(url, {
      method: "post",
      headers: {
        Authorization: 'Bearer ' + (ScriptApp.getIdentityToken())
      },
      payload: {
        'path': path,
        'data': JSON.stringify(data)
      }
      // muteHttpExceptions: true
    },
      // Backoff options: don't re-try if, e.g. creating user and user already exists
      {
        failOn: [/invalid argument/i, /not authorized/i]
      }
    );

    // console.log(response.getContentText())
    var result = JSON.parse(response.getContentText());
    // console.log(JSON.stringify(result, null, 2));
    return result
  }

  /**
   * Set data in a path (node) of the firebase realtime database, replacing any data already there
*/
  ns.set = function (path, data)
  {
    if (!path) throw new Error("FirebaseDatabase: path required")
    var url = FetchTools.formQueryUrl(URL, { 'path': encodeURIComponent(path) })
    // console.log("Setting data on path %s: %s", path, JSON.stringify(data))
    var response = FetchTools.backoffOne(url, {
      method: "put",
      headers: {
        Authorization: 'Bearer ' + (ScriptApp.getIdentityToken())
      },
      payload: {
        'path': path,
        'data': JSON.stringify(data)
      }
      // muteHttpExceptions: true
    },
      // Backoff options: don't re-try if, e.g. creating user and user already exists
      {
        failOn: [/invalid argument/i, /not authorized/i]
      }
    );

    // console.log(response.getContentText())
    var result = JSON.parse(response.getContentText());
    // console.log(JSON.stringify(result, null, 2));
    return result
  }


  /**
   * Delete data in a path (node) of the firebase realtime database
*/
  ns.remove = function (path)
  {
    if (!path) throw new Error("FirebaseDatabase: path required")
    var url = FetchTools.formQueryUrl(URL, { 'path': encodeURIComponent(path) })

    var response = FetchTools.backoffOne(url, {
      method: "delete",
      headers: {
        Authorization: 'Bearer ' + (ScriptApp.getIdentityToken())
      },
      // muteHttpExceptions: true
    },
      // Backoff options: don't re-try if, e.g. creating user and user already exists
      {
        failOn: [/invalid argument/i, /not authorized/i]
      }
    );

    // console.log(response.getContentText())
    var result = JSON.parse(response.getContentText());
    // console.log(JSON.stringify(result, null, 2));
    return result
  }

  ns.push = function (path, data)
  {
    if (!path) throw new Error("FirebaseDatabase: path required")
    let key = getUid()
    path += '/' + key
    var result = ns.set(path, data)
    return {
      value: result,
      key: key
    }
  }

  return ns;

  // -----------------
  // Private functions

})()

