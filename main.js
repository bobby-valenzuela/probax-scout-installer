const electron = require('electron');
const fs = require('fs');
const axios = require('axios');

const {app, BrowserWindow, Menu, ipcMain, Notification, webContents} = electron;

// SET ENV
process.env.NODE_ENV = 'production';

let win;

// Listen for ready app
app.on('ready',function(){
    // create new window
    win = new BrowserWindow(
            {
                hasShadow:true, 
                width: 430, 
                height:600,
                resizable:false, 
                maximizable:false, 
                show:false,
                frame:false, 
                transparent:true,
                webPreferences:{nodeIntegration:true},
                title: 'Probax Scout Setup'
            }
        );

    win.loadURL(`file://${__dirname}/index.html`);


    win.on('ready-to-show', function() { 
        win.show(); 
        win.focus(); 
      });
    win.on('closed',()=>app.quit());
    if(process.env.NODE_ENV !== 'production') win.webContents.openDevTools();

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert Menu
    Menu.setApplicationMenu(mainMenu);

    if (process.platform === 'win32') {      
      app.setAppUserModelId("probax.scout-installer");
      //app.setAppUserModelId(process.execPath);
    }

});

///////////////////////////////////////////////////////
// onMainEvents

// handle 'OK' status
ipcMain.on('code:submit', (e, fileData) =>{

    const path = `C:\\Program Files (x86)\\Probax Scout\\probax.conf`;
    const pathDir = `C:\\Program Files (x86)\\Probax Scout\\`;
    // win.webContents.send('getCode:get',code);
    // fs.writeFile('read.txt', `Response:${fileData}`,'utf8',err=>{});

    if (!fs.existsSync(pathDir)){
        fs.mkdir(pathDir, err=> console.log(err));
        fs.writeFile(path,`${fileData}`, (err)=>{console.log(err)});
    }else{
        fs.writeFile(path,`${fileData}`, (err)=>{console.log(err)});
    }

    // NOTIFICATION
    const myNotification = new Notification({
        title: 'Scout Alert',
        body: 'Scout Setup Complete!',
        icon: './assets/icons/win/icon.png'
    });
    myNotification.show();

});

// handle 'NO' status
ipcMain.on('code:submitFail', (e, fileData) =>{

    // NOTIFICATION
    const myNotification = new Notification({
        title: 'Scout Alert!',
        body: 'Unable to complete setup!',
        icon: './assets/icons/png/icon.png'
    });
    myNotification.show();

});

// Activate custom close button
ipcMain.on('close-me', (evt, arg) => {
    app.quit();
});

// END onMainEvents
///////////////////////////////////////////////////////


// Create menu template
const mainMenuTemplate = [
    {
        label: 'File',
        click(){
            app.quit();
        }
    }
];

// Add dev tools menu item if not in production
if (process.env.NODE_ENV !== 'production'){
    mainMenuTemplate.push({
        label: 'Dev Tools',
        submenu:[
            {
                label: 'Toggle DevTools',
                click(item, focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'Reload'
            }
        ]
    });
}
