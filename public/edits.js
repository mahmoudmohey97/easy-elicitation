var online;
var users = [];
var edits = [];

function edit()
{
    showActiveUsers();
    showLatestEdit();
}

/*******************
 * SHOW ONLINE USERS
 *******************/
function showActiveUsers()
{
    globalEditor.toolbar.addSeparator();
    globalEditor.menus.put('online', new Menu(mxUtils.bind(this, function(menu, parent)
    {
        globalEditor.menus.addMenuItems(menu, users, parent);
    })));
    online = globalEditor.toolbar.addMenu('Active Users [' + users.length + ']', null, true, 'online', null, true);
}

function addActiveUser(username)
{
    users.push(username);
    changeOnlineCount();
    globalEditor.actions.put(username, new Action(username, function() {}));
    globalEditor.menus.put('online', new Menu(mxUtils.bind(this, function(menu, parent)
    {
        globalEditor.menus.addMenuItems(menu, users, parent);
    })));
}

function removeActiveUser(username)
{
    users.splice(users.indexOf(username), 1);
    changeOnlineCount();
    globalEditor.menus.put('online', new Menu(mxUtils.bind(this, function(menu, parent)
    {
        globalEditor.menus.addMenuItems(menu, users, parent);
    })));
}

function changeOnlineCount()
{
    var old = online;
    online = globalEditor.toolbar.addMenu('Active Users [' + users.length + ']', null, true, 'online', null, true);
    globalEditor.toolbar.container.replaceChild(online, old);
}

/*******************
 * SHOW Latest EDIT
 *******************/
function showLatestEdit()
{
    globalEditor.toolbar.addSeparator();
    globalEditor.menus.put('edits', new Menu(mxUtils.bind(this, function(menu, parent)
    {
        // globalEditor.menus.addMenuItems(menu, edits, parent);
    })));
    latest = globalEditor.toolbar.addMenu('No modifications yet', null, true, 'edits', null, true);
    // console.log(globalEditor.actions);
}

function changeLatestEdit(username)
{
    var old = latest;
    if(globalEditor.toolbar.container.contains(old))
    {
        latest = globalEditor.toolbar.addMenu("Last modified by " + username, null, true, 'edits', null, true);
        globalEditor.toolbar.container.replaceChild(latest, old);
    }
}