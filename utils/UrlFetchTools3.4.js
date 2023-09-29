
/**
 * FetchTools 
 * by Aaron Dunigan-AtLee 
 * aaron.dunigan.atlee [at gmail]
 * March 2022
 * v. 3.0 
 *  -- add fetchOptions and clean up the logic
 * v. 3.1
 *  -- handle null values in formQueryUrl
 *  v 3.2 
 *  -- handle missing params in formQueryUrl
 *  v 3.3
 *  -- encode URI component in formQueryUrl
 *  v 3.4
 *  -- Change default batch size from 500 to 200, based on experimentation with rate limits
 */
var FetchTools = (function (ns)
{
  // By experimentation, as of 7.20.23 it seems that batch size > 200 triggers google's rate limit quota
  // I cannot find documentation about this
  var DEFAULT_BATCH_SIZE = 200;
  var DEFAULT_RETRIES = 2;
  var DEFAULT_BASE_DELAY = 1000;

  /**
   * Fetch a single url with exponential backoff
   * @param {string} url 
   * @param {Object} fetchOptions As for UrlFetchApp.fetch(url, options)
   * @param {Object} backoffOptions .retries {integer} Number of retries (i.e. 1 less than number of attempts, so 0 retries means try once)
   *                         .baseDelay {integer} Initial delay in ms; doubles each time thereafter.
   *                         .failOn {RegExp[]}  Only retry if error message doesn't match one of these RegExp's
   *                         .retryOn {RegExp[]}  Only retry if error message matches one of these RegExp's (takes priority over .failOn)
   * @returns {any} Return value of the function
   */
  ns.backoffOne = function (url, fetchOptions, backoffOptions)
  {
    backoffOptions = backoffOptions || {};
    var retries = backoffOptions.retries || DEFAULT_RETRIES;
    var baseDelay = backoffOptions.baseDelay || DEFAULT_BASE_DELAY;

    fetchOptions = fetchOptions || {};

    for (var attempt = 0; attempt <= retries; attempt++)
    {
      try
      {
        return UrlFetchApp.fetch(url, fetchOptions);
      } catch (err)
      {
        var giveUp = (attempt == retries)
          || ((backoffOptions.retryOn instanceof Array) && !backoffOptions.retryOn.some(function (pattern) { return pattern.test(err.message) }))
          || ((backoffOptions.failOn instanceof Array) && backoffOptions.failOn.some(function (pattern) { return pattern.test(err.message) }))
        if (giveUp)
        {
          console.warn("Fetch with backoff: Giving up on %s", url)
          throw err
        }
        console.warn('Fetch failed for\n%s\n%s attempts remain\n%s', url, retries - attempt, err.message)
        Utilities.sleep(baseDelay * Math.pow(2, attempt));
      }
    }

  } // fetchTools.backoffOne()

  ns.backoffBatches = function (requests, backoffOptions)
  {
    backoffOptions = backoffOptions || {};
    var batchSize = backoffOptions.batchSize || DEFAULT_BATCH_SIZE;

    console.log("Fetching %s http requests asychronously in batches of %s", requests.length, batchSize)
    var responses = [];
    var batchStart = 0;
    do
    {
      console.log("This batch starts at %s", batchStart)
      var batchResponses = ns.backoffAll(requests.slice(batchStart, batchStart + batchSize), backoffOptions);
      // Log the responses to a file if indicated
      if ("function" === typeof backoffOptions.log?.folder?.createFile)
      {
        backoffOptions.log.folder.createFile(
          (backoffOptions.log.filename || 'Log')
          + ` ${Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss')}.json`,
          JSON.stringify(
            batchResponses.map(response => ({
              content: JSON.parse(response.getContentText()),
              responseCode: response.getResponseCode()
            })),
            null, 2),
          'application/json'
        )
      }
      responses = responses.concat(batchResponses);
      batchStart += batchSize;
    } while (batchStart < requests.length)
    return responses;
  } // fetchTools.backoffBatches()

  ns.backoffAll = function (requests, backoffOptions)
  {
    backoffOptions = backoffOptions || {};
    var retries = backoffOptions.retries || DEFAULT_RETRIES;
    var baseDelay = backoffOptions.baseDelay || DEFAULT_BASE_DELAY;
    var failOn = backoffOptions.failOn || [/Invalid argument/];

    for (var attempt = 0; attempt <= retries; attempt++)
    {
      try
      {
        return UrlFetchApp.fetchAll(requests);
      } catch (err)
      {
        var giveUp = (attempt == retries)
          || ((backoffOptions.retryOn instanceof Array) && !backoffOptions.retryOn.some(function (pattern) { return pattern.test(err.message) }))
          || ((failOn instanceof Array) && failOn.some(function (pattern) { return pattern.test(err.message) }))
        if (giveUp)
        {
          console.warn("fetchAll with backoff: Giving up")
          throw err
        }
        console.warn('fetchAll failed, %s attempts remain\n%s', retries - attempt, err.message)
        Utilities.sleep(baseDelay * Math.pow(2, attempt));
      }
    }
  } // fetchTools.backoffAll()


  /**
   * Convert a url and object of key: value pairs to a url with query parameters (.../?key=value&key2=value2&...)
   * @param {string} url Base url
   * @param {Object} params The query parameters
   * @returns {string} the query url
   */
  ns.formQueryUrl = function (url, params)
  {
    if (!params) return url
    return url + '?' + Object.keys(params)
      .map(function (key)
      {
        return key + '=' + (params[key] === null ? '' : encodeURIComponent(params[key]))
      })
      .join('&')
  }

  return ns

})(FetchTools || {})
