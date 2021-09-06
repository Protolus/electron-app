const os = require('os');
var items = [];

const menu = function(list){
    let menuItems = [];
    list.forEach(function(prefix){
        //todo: switch to supporting multiple adds per filter
        var item = items.find(function(item){
            return (item.label.indexOf(prefix) === 0);
        });
        if(item) menuItems.push(item);
    });
    return menuItems;
}

module.exports = function(pkg, config, app, actions){
    if(actions) items = actions;
    switch(os.platform()){
        case 'darwin':
            app.application.menu(pkg.name, menu([
                'About ',
                'View License',
                'Version ',
                'Check for Update',
                '--------',
                'Preferences',
                '--------',
                'Install ',
                '--------',
                'Services',
                '--------',
                'Hide Atom',
                'Hide Others',
                'Show All',
                '--------',
                'Quit '
            ]));
            app.application.menu('File', menu([
                'New ',
                '--------',
                'Open ',
                '--------',
                'Save ',
                '--------',
                'Close '
            ]));
            app.application.menu('Edit', menu([
                'Undo',
                'Redo',
                '--------',
                'Cut',
                'Cut ',
                'Copy',
                'Copy ',
                'Paste',
                'Paste ',
            ]));
            app.application.menus();
            break;
        case 'win32':
            break;
        case 'linux':
        case 'aix':
        case 'freebsd':
        case 'openbsd':
            break;
        //TODO: detect raspberry pi
    }
}
