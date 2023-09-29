var Vertex = (function (ns = {}) {
  var API_NAME = 'Vertex'

  ns.checkService = checkService

  ns.getSummary = function () {

    const instance = {
      content: "This is a test string to Google Vertex AI."
    };

    const payload = {
      "instances": [instance],
      "parameters": []
    };

    return fetch(
      'POST',
      `projects/testing-project-400518/locations/us-east1/publishers/google/models/text-bison@001:predict`,
      payload
    )

  }


  return ns;

  // -----------------
  // Private functions

  // -----------------
  // Private functions

  function fetch(method, endpoint, payload) {
    var root = 'https://us-east1-aiplatform.googleapis.com/v1/';
    console.log("Calling Google speech-to-text endpoint '%s' with method %s", root + endpoint, method)

    var params = {
      'method': method,
      'headers': {
        'Authorization': "Bearer " + ScriptApp.getOAuthToken(),
        // 'Authorization': "Bearer " + getService().getAccessToken(),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    };
    if (payload) {
      params.payload = JSON.stringify(payload)
      console.log("Payload is %s", JSON.stringify(payload))
    }
    if (DEBUG) params.muteHttpExceptions = true;

    var response = FetchTools.backoffOne(root + endpoint, params);
    var content = response.getContentText();
    // Some endpoints return empty response.
    if (!content) {
      console.log("API returned an empty response")
      return null;
    }
    console.log(content)
    var json = JSON.parse(content);
    return json;

  }

  function getService() {
    var propertyStore = PropertiesService.getScriptProperties()
    // For auth details see 
    // https://stackoverflow.com/questions/61466912/how-can-i-authorize-google-speech-to-text-from-google-apps-script
    // and https://cloud.google.com/speech-to-text/docs/before-you-begin
    return OAuth2.createService('Speech-To-Text Token')
      .setTokenUrl('https://oauth2.googleapis.com/token')
      // TODO: Move these to props
      // .setPrivateKey(propertyStore.getProperty('speech_to_text_private_key'))
      // .setIssuer("audio-transcription@prison-call-review.iam.gserviceaccount.com")
      .setPropertyStore(PropertiesService.getScriptProperties())
      .setScope('https://www.googleapis.com/auth/cloud-platform');
  }

  function checkService() {
    var service = getService();
    if (service.hasAccess()) {
      console.log(service.getAccessToken());
    } else {
      console.log(service.getLastError());
    }
  }


})()