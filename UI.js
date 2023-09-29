/**
 * Create custom menu(s)
 * @param {Event} e 
 */
function onOpen(e)
{
  var ui = SpreadsheetApp.getUi();
  // var menu = ui.createMenu('🛠️ Admin Tools')
  //   .addItem('➕ Create project', 'showNewProjectSidebar')

  // addTutorialSubMenu(menu, ui);
  // menu.addToUi();
  addDebugMenu(ui, true);
  // addTutorialMenu(ui)
}
