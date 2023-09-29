var Api = (function (ns = {})
{
  var API_NAME = ''

  ns.something = function ()
  {
    return fetch('GET', 'endpoint')
  }


  return ns;

  // -----------------
  // Private functions

  function fetch(method, endpoint, payload, queryParams, backoffOptions)
  {

    var root = '';

    var url = root + endpoint;
    console.log("Calling %s endpoint %s with method %s", API_NAME, url, method)

    var params = {
      'method': method,
      'headers': getHeaders()
    };

    if (queryParams)
    {
      url = FetchTools.formQueryUrl(url, queryParams)
      if (DEBUG) console.log("Query params are %s", JSON.stringify(queryParams))
    }

    if (payload)
    {
      params.payload = JSON.stringify(payload)
      if (DEBUG) console.log("Payload is %s", JSON.stringify(payload))
    }
    if (DEBUG) params.muteHttpExceptions = true;

    var response = FetchTools.backoffOne(url, params, backoffOptions);
    var content = response.getContentText();
    // Some endpoints return empty response.
    if (!content)
    {
      console.log("%s returned an empty response", API_NAME)
      return null;
    }
    if (DEBUG) console.log(content)
    var json = JSON.parse(content);
    return json;
  }

  function getHeaders()
  {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
})()