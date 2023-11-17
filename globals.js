/**
 * Scripts written by Cactus Flower Digital Solutions
 * aaron.dunigan.atlee [at gmail]
 * September 2023
 */

/* This spreadsheet */
// var SS = SpreadsheetApp.getActive();
const TIMEZONE = 'America/Los_Angeles'
const PROPERTY_STORE = PropertiesService.getScriptProperties();
const Instance = JSON.parse(PROPERTY_STORE.getProperty('instance') || '{}');

var APP_TITLE = Instance.appTitle || "Vertex AI Test"

const PERCENT_PRECISION = 1000000

/* App branding */
var BRAND_BACKGROUND_COLOR = 'white'
var BRAND_HIGHLIGHT_COLOR = '#008C89' // Teal from website
var BRAND_PRIMARY_COLOR = '#6bcaba' // Light teal from website
const BRAND_PRIMARY_FADED_COLOR = '';
var BRAND_TEXT_COLOR = '#212529' // Black-ish
var BRAND_SECONDARY_COLOR = '#354a5a' // Gray from website
var BRAND_TERTIARY_COLOR = '' // Gray from website header
var BRAND_PRIMARY_HOVER_COLOR = "#58c3b1" // 
var BRAND_SECONDARY_HOVER_COLOR = ""
var BRAND_SECONDARY_FADED_COLOR = ""

var BRAND_LOGO_URL = 'https://www.prisoncallreview.net/assets/img/logo.jpg'
var BRAND_FAVICON_URL = 'https://www.prisoncallreview.net/assets/img/ico.png'

// User roles
var ROLE = {
  'none': 'none',
  'admin': 'admin',
  'dev': 'dev'
}

// User views
var USER_VIEW = {
  'ADMIN': 'ADMIN',
}
