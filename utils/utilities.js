
/**
 * Save a JSON object to a Google Drive file
 * @param {Object} object 
 * @param {string} filename For best results, should end in .json
 * @param {DriveApp.Folder} folder Optional, defaults to the root folder
 */
function saveJsonToDrive(object, filename = 'sample.json', folder)
{
  folder = folder || DriveApp.getRootFolder()
  folder.createFile(
    filename,
    JSON.stringify(object, null, 2),
    'application/json'
  )
}


/**
 * 
 */
function getJsonFromFile(fileId)
{
  const json = DriveApp.getFileById(fileId).getBlob().getDataAsString()
  console.log(json)
  return JSON.parse(json)
}