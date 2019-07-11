let fs = require('fs');
let PDFParser = require("pdf2json");
let moment = require('moment');
let chalk = require('chalk');
const request = require('request');
let input = process.argv[2].split(',');
let userName=input[0];
var delayy=input[1];
if(delayy<=4&&0<=delayy&&delayy) console.log(chalk.blue(`The progrem has been initiated successfully`))
else{
    console.log(chalk.red.inverse('Delay has to be beetween 0 and 4!'))
    process.exit(1);
}
var decoded = [];
let token = 'XXX'
var url = `https://api.telegram.org/${token}`;
let pdfParser = new PDFParser();
var ids = { //add as many names as you'd like
    Nave: 47976441,
    nave: 47976441,
    Matan: 58416070,
    matan: 58416070
}
var sendMsg = (name, msg) => {

    request({ url: (`${url}/sendMessage?chat_id=${ids[name]}&text=${msg}`) }, (error, response) => {
        if (response) {
            console.log(chalk.green.inverse(`Message was sent successfully to ${name}: ${msg}`))
        }
    })
}

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    var decoded = [];
    //goes over the important data, decodes it and moves it into >decoded
    for (let i = 0; i < pdfData.formImage.Pages.length; i++) {

        // decoded[i] = {
            // text: decodeURI(pdfData.formImage.Pages[pageNumber].Texts[i].R[0].T),
            // x: pdfData.formImage.Pages[pageNumber].Texts[i].x,
            // y: pdfData.formImage.Pages[pageNumber].Texts[i].y,
            // w: pdfData.formImage.Pages[pageNumber].Texts[i].w,
            // id: i
        // }
        pdfData.formImage.Pages[i].Texts.forEach((text)=>{
            let temp ={
                text: decodeURI(text.R[0].T),
                x: text.x,
                y: text.y,
                w: text.w
            }

            decoded.push(temp)
        })
        

    }

    decoded.forEach((str) => {
        str.text = str.text.replace('%3A', '')
    })
    goOn(decoded);
});
let goOn = (decoded) => {

    
    var shows = []
    var showsIdx = 0;
    for (let i = 0; i < decoded.length - 2; i++) {

        //continiue from here! check if +2 is a match as well and if yes go on with your plan
        if (decoded[i].text.match(/(\d\d\d\d)/) && decoded[i + 2].text.match(/(\d\d\d\d)/)) {
            //console.log(`Starts at ${decoded[i].text} and ends at ${decoded[i + 2].text}`)

            if (decoded[i - 2].x > 15) {
                //console.log(`Movie is ${decoded[i - 1].text} ${decoded[i - 2].text} `)
                shows[showsIdx] = {
                    name: (decoded[i - 1].text + ' ' + decoded[i - 2].text),
                    room: decoded[i + 3].text,
                    start: decoded[i].text,
                    lenght: decoded[i + 1].text,
                    end: decoded[i + 2].text
                }
            } else {
                //console.log(`Movie is ${decoded[i - 1].text}`)
                shows[showsIdx] = {
                    name: decoded[i - 1].text,
                    room: decoded[i + 3].text,
                    start: decoded[i].text,
                    lenght: decoded[i + 1].text,
                    end: decoded[i + 2].text,

                }
            }
            showsIdx++;
        }
    }

    
    console.log(chalk.white.inverse(`${showsIdx} shows have been loaded!`));
    shows.forEach((show) => {
        show.room = show.room.replace('םלוא', '');
        show.start=('0000'+(+show.start+(+delayy))).substr(-4);
    })
    fs.writeFileSync('shows.json', JSON.stringify(shows));
    runTime(shows)
}
pdfParser.loadPDF("src.pdf");
async function runTime(shows) {
    sendMsg(userName, ` this is a message letting you know that the bot has been initiated with your name!`)
    while (true) {
        let currentTime = (moment().format('HHmm'));
        console.log(`${currentTime} is the current time`)
        shows.forEach((show) => {
            if (show.start == currentTime) {
                sendMsg(userName, `${show.room} Should have started!`)
            }
        })
        await sleep(59900);
    }
}
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    })
}
