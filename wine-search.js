const util = require('util');
const fs =require('fs');
const moment = require('moment');

const jsdom = require('jsdom');

const exec = util.promisify(require('child_process').exec);

const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);


const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};


//放置酒資料的陣列
let arrLink = [];
//需要一個走訪網址

// let url = `https://www.wine-searcher.com/find/screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa/1992/taiwan#t3`;

let arrUrl = [
'https://www.wine-searcher.com/find/screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa/1992/taiwan#t3',
'https://www.wine-searcher.com/find/latour+pauillac+medoc+bordeaux+france/2006/taiwan#t3'
];

(
        async function() {
            //-L一值不斷轉只
            //標頭header內是一個物件具有健值對
            //-X = post delete push
    for(let url of arrUrl){
          let  {stdout, stderr} =  await exec(`curl -X GET ${url} -L -H "User-Agent: ${headers['User-Agent']}" -H "Accept: ${headers['Accept']}" -H "Accept-Language: ${headers['Accept-Language']}"`);
          let strChartData = '';//價格json文字資料
          let dataChartData = {};//將json轉成物件型態
          let arrMain = []; //放置架個物件的陣列 
          let datetime = '';//放置日期時間
          let price = 0;//價格

          //找出酒名稱政則
          let pattern = /https:\/\/www\.wine-searcher\.com\/find\/([a-z+]+)\/(1[0-9]{3}|20[0-9]{2})\/taiwan#t3/g;
        let arrMatch = null;
        let strJsonFileName = '';//儲存家浩底線的jsonua/6t/ 

            // console.log(stdout);pattern轉變成陣列
        if((arrMatch = pattern.exec(url)) !== null) {
            // console.log(arrMatch)

            // [
            //     'https://www.wine-searcher.com/find/screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa/1992/taiwan#t3',
            //     'screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa',
            //     '1992',
            //     index: 0,
            //     input: 'https://www.wine-searcher.com/find/screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa/1992/taiwan#t3',
            //     groups: undefined
            //   ]
 
            //先將字串帶到變數中screaming+eagle+cab+sauv+napa+valley+county+north+coast+california+usa

            strJsonFileName = arrMatch[1];

            //將上述字串中+取代為_
            strJsonFileName = strJsonFileName.replace(/\+/g, '_');
            //將後面年份用 _與字串連結 EX:screaming_eagle_cab_sauv_napa_valley_county_north_coast_california_usa_1992
            strJsonFileName = strJsonFileName + '_' + arrMatch[2];
        
        //stdout是html
        }
        // console.log(strJsonFileName);
        //取得圖表當中字串後的物件內容

        strChartData = $(stdout).find('div#hst_price_div_detail_page.card-graph').attr('data-chart-data');
        //將JSON字串轉為物件將main陣列取出來

        dataChartData = JSON.parse(strChartData)
        arrMain = dataChartData.chartData.main;
        
        //arr=main裡面的子陣列
        //arr[0]:時間戳季,轉為日期時間,註: 毫秒=>秒必須/1000
        //arr[1]:價格預設美金
            for(let arr of arrMain) {
                console.log(arr)
                datetime = moment.unix(parseInt(arr[0])/1000).format("YYYY-MM-DD");

                //取得價格
                price = Math.round(arr[1]);

                // console.log(`年月日:${datetime}`);
                // console.log(`價格美金:${price},轉換為台幣為${price*30}`);
                 //整理資訊
                arrLink.push({
                    'dateTime': datetime,
                    'price_us': price,
                    'price_tw':(price*30)
                });
    }
        //    console.log(arrLink);

        //儲存json
        await fs.writeFileSync(`downloads/${strJsonFileName}.json`, JSON.stringify(arrLink, null, 4));

        //初始化
        arrLink = [];//將陣列清空以便儲存
            }

           
        }

)();