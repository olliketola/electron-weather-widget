const { app, BrowserWindow, ipcMain } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 250,
    height: 600,
    webPreferences: {
        nodeIntegration: true
    },
    frame: false,
    transparent: true
  })

  // and load the index.html of the app.
  win.loadFile('index.html')
  // Emitted when the window is closed.

 // win.webContents.openDevTools()

  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null

  })
}

app.on('ready', createWindow)

ipcMain.on('getData', (event, arg) => {
  fetchWeatherData("Jyväskylä", event);
})

ipcMain.on('close', (event, arg) => {
  console.log("close")
})


// Quit when all windows are closed.
app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) {
    createWindow()
  }
})


function fetchWeatherData(location, event){
  let now = new Date()
  console.log(now.toISOString())
  let url = "http://opendata.fmi.fi/wfs/fin?service=WFS&version=2.0.0&request=GetFeature&storedquery_id=fmi::forecast::hirlam::surface::point::simple&place="+location+"&timestep=120";
  const axios = require('axios');
  const xml2js = require('xml2js');
  const parser = new xml2js.Parser({ attrkey: "ATTR" });
    axios.get(encodeURI(url))
      .then(function (response) {
        parser.parseString(response.data, function(error, result) {
          if(error === null) {

            let resultObjs = 
            {
              "data":[],
              "location":location
            };

            let temp  = null;
            let time = null;
            let symbol = null; 
            let wind = null;
            let pressure = null;

             for(let item of result['wfs:FeatureCollection']['wfs:member']){
              
               if(item['BsWfs:BsWfsElement'][0]['BsWfs:ParameterName'][0].trim() ==="Temperature"){
                  temp = item['BsWfs:BsWfsElement'][0]['BsWfs:ParameterValue'][0];
                  time = item['BsWfs:BsWfsElement'][0]['BsWfs:Time'][0];
               }

               if(item['BsWfs:BsWfsElement'][0]['BsWfs:ParameterName'][0].trim() === "WeatherSymbol3"){
                 symbol = item['BsWfs:BsWfsElement'][0]['BsWfs:ParameterValue'][0]; 
               }

               if(item['BsWfs:BsWfsElement'][0]['BsWfs:ParameterName'][0].trim() === "WindSpeedMS"){
                wind = item['BsWfs:BsWfsElement'][0]['BsWfs:ParameterValue'][0]; 
              }

              if(item['BsWfs:BsWfsElement'][0]['BsWfs:ParameterName'][0].trim() === "Pressure"){
                pressure = item['BsWfs:BsWfsElement'][0]['BsWfs:ParameterValue'][0]; 
              }
              
              
               if(temp != null && time != null && symbol != null && wind != null && pressure != null){

                resultObjs.data.push({
                  "temp":temp, 
                  "time": time, 
                  "symbol": symbol,
                  "wind": wind,
                  "pressure": pressure
                });

                temp  = null;
                time = null;
                symbol = null; 
                wind = null;
                pressure = null;
               }

             }
             event.reply('data-response', resultObjs)
          }
          else {
              console.log(error);
          }
      });
      })
      .catch(function (error) {
        console.log(error);
      })
      .finally(function () {
      });
}