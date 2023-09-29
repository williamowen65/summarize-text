
function setInstanceProperties(props)
{
  props = props || {
  }
  PropertiesService.getScriptProperties().setProperty('instance', JSON.stringify(props))
}

function setInstanceProperty(key, value)
{
  key = key || ''
  value = value || ''
  const config = JSON.parse(PropertiesService.getScriptProperties().getProperty('instance') || '{}')
  config[key] = value;
  PropertiesService.getScriptProperties().setProperty('instance', JSON.stringify(config))
  console.log("Instance property '%s' set to '%s'", key, value)
}

function logInstanceProperties()
{
  console.log(JSON.stringify(Instance, null, 2))
}