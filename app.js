const { app, BrowserWindow, Menu } = require('electron');
const Application = require('app-term-kit');
const Emitter = require('extended-emitter');

function windowConfig(windowName, configs){
    let newConfig = {};
    let defaults = windowPrefs;
    let prefix = windowName+'-';
    configs.forEach(function(config){
        //TODO: maybe copy to deref?
        Object.keys(config).forEach(function(key){
            if(key.indexOf(prefix) === 0){
                if(!newConfig[key.substring(prefix.length)]){
                    newConfig[key.substring(prefix.length)] = config[key];
                }
            }else{
                if(!newConfig[key]) newConfig[key] = config[key];
            }
        });
    });
    return newConfig;
};

const ElectronKit = function(name, options, cb){
    var windows = {};
    const application = new Application(name, options);
    this.application = application;
    this.windows = windows;
    const Win = function(name, options){
        let newConfig = {};
        let defaults = windowPrefs;
        let prefix = windowName+'-';
        var configs = (options && options.stack) || [];
        configs.forEach(function(config){
            //TODO: maybe copy to deref?
            Object.keys(config).forEach(function(key){
                if(key.indexOf(prefix) === 0){
                    if(!newConfig[key.substring(prefix.length)]){
                        newConfig[key.substring(prefix.length)] = config[key];
                    }
                }else{
                    if(!newConfig[key]) newConfig[key] = config[key];
                }
            });
        });
        let win = new BrowserWindow(windowConfig(name, [
          applicationConfig, windowPrefs, {
              width: options.width,
              height: options.height
          }
        ]));
        var location = url.format(options.url);
        console.log(location, options);
        win.loadURL(location);
        win.on('closed', function(){
          windows[name] = null
        });
        var ob = this;
        this.save = function(){
            ob.application.save.apply({}, arguments);
        }
    }
    var ob = this;

    if(cb){
        application.config(function(err, conf, writeConfig){
            application.save = function(){
                let incomingConf = arguments.length > 1?arguments[0]:conf;
                let callback = arguments.length > 1?arguments[1]:arguments[0];
                writeConfig(incomingConf, function(){
                    if(callback) callback();
                });
            }
            if(cb) cb(null, ob, conf);
        });
        //TODO: support other async actions on init
    }

    app.on('ready', function(){
        if(cb){
            application.config(function(err, conf, writeConfig){
                application.save = function(){
                    let incomingConf = arguments.length > 1?arguments[0]:conf;
                    let callback = arguments.length > 1?arguments[1]:arguments[0];
                    writeConfig(incomingConf, function(){
                        if(callback) callback();
                    });
                }
                if(cb) cb(null, application, conf);
            });
            //TODO: support other async actions on init
        }
    });

    var emitter = new Emitter();
    emitter.onto(this);

    app.on('window-all-closed', function(){
      if (process.platform !== 'darwin') app.quit()
    });

    app.on('activate', function(){
        emitter.emit('app-focus');
        //TODO: update menus
      //if(mainWindow === null) createWindow();
      //if(menu === null) createMenu();
    });

    this.electron = app;

    this.Window = Win;
};



process.exports = function(){
    Kit: ElectronKit
}
