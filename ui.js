$(function () {
    console.log("ready!");
    $('#settings').hide();
    const { ipcRenderer } = require('electron')
    ipcRenderer.send('getData', '')
   
    ipcRenderer.on('data-response', (event, arg) => {
        console.log(arg) // prints "pong"
        $('#location').html(arg.location);
        let first = arg.data.shift();
        $('#big-image').attr('src',"pics/" + Math.round(first.symbol) + ".svg");
        $('#temp').text(first.temp+"\xB0C");
        $('#wind').text("WindSpeed:" + first.wind+ " m/s");
        $('#pressure').text("AirPressure:"+first.pressure+ " hPa");
        $('#date').text(new Date(first.time).toLocaleDateString());
        let previousday = new Date(first.time).getDay();
        arg.data.forEach(item => {
            let date = new Date(item.time);
            let time = date.toLocaleTimeString();
            let day = date.getDay();
            $('#data').append("<tr><td style='font-size:10px'  colspan='2'>" + time + "</td></tr>")
            $('#data').append("<tr><td><img src='pics/" + Math.round(item.symbol) + ".svg'/></td><td>" + item.temp + "\xB0C</td></tr>")
            if (day != previousday) {
                $('#data').append("<tr style='border-bottom: 1px sodlid white'><td  colspan='2'>" + date.toLocaleDateString() + "</td></tr>")
            }
            previousday = day;
        });
    })

    $('#settings_click').click(() => {
       // ipcRenderer.send('close', '')
       alert("test")
    });

    $('#close').click(function(){
        alert("test")
        //ipcRenderer.send('close', '')
    });
});