const { app, BrowserWindow, Menu } = require('electron');
const Application = require('app-term-kit');
const Emitter = require('extended-emitter');
const Mangrove = require('mangrove');
const url = require("url");

let windowPrefs = {};
let applicationConfig = {};

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

//TODO: maybe someday allow multiple instances
const ElectronKit = function(name, options, cb){
    var windows = {};
    let application = new Application(name, options);
    this.application = application;
    this.windows = windows;
    if(options.windowDefaults) windowPrefs = options.windowDefaults;
    const Win = function(windowName, options){
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
        win.loadURL(location);
        win.on('closed', function(){
          windows[name] = null
        });
        var ob = this;
        this.save = function(){
            application.save.apply({}, arguments);
        }
        this.electron = win;
    }
    var ob = this;

    var handleData = function(cb){
      if(options.data){
        ob.db = new Mangrove(options.data);
        ob.db.ready(function(){
          cb();
        })
      } else cb();
    };

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
                var menus = [];
                application.menu = function(name, submenu){
                    menus.push({
                      label: name,
                      submenu: submenu
                    });
                }
                application.menus = function(name, submenu){
                    let menu = Menu.buildFromTemplate(menus);
                    Menu.setApplicationMenu(menu);
                }
                applicationConfig = conf;
                handleData(function(){
                  if(cb) cb(null, ob, conf);
                });
            }, true);
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
    });

    this.electron = app;

    this.Window = Win;
};



module.exports = {
    Kit: ElectronKit
}
