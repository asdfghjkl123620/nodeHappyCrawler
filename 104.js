const Nightmare = require('nightmare');
const nightmare = Nightmare({ show: true, width: 1280, height: 800 });//把不是promise轉換
const util = require('util');
const fs =require('fs');

//引入jqiery相關機制
//拿到整包html做一些事情
const jsdom = require('jsdom');
//拿到window
//拿到這個就可以在後端操作dom
//cheerio走訪html文字
//這個可以對dom進行操作
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const $ = require('jquery')(window);

//const例外

//使工具具有promise特性
const writeFile = util.promisify(fs.writeFile);
// 上面這行駛他不用回呼用await
// fs.writeFile((err,value)=>{});//會友回呼地域
const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};

//搜尋關鍵字用(放物件)
//放置網頁元素
let arrLink = [];

let strKeyword = 'node.js';

//進行搜尋
async function search(){
    console.log('進行搜尋');


    //輸入關鍵字選擇地區按下搜尋

    await nightmare
    .goto("https://www.104.com.tw",headers)
    .type('input#ikeyword',strKeyword)
    .wait(2000)//等待數秒;
    .click('span#icity')//按下地區
    .wait(2000)//等待數秒
    .click('div.second-floor-rect input[value="6001001000"]')//按下台北市
    .wait(2000)//等待數秒
    .click('div.second-floor-rect input[value="6001002000"]')//選擇新北勢
    .wait(2000)//等待數秒
    .click('button.category-picker-btn-primary')//按下確定按鈕
    .wait(2000)//等待數秒
    .click('button.btn.btn-primary.js-formCheck')//按下搜尋按鈕
    .catch((err)=>{
        throw err;
    });

}
//選擇全職兼職選項
async function setJobType(){
console.log('選擇全職兼職選項');
await nightmare
.wait(2000)
.click('ul#js-job-tab > li[data-value="1"]');//點選全職
}

//滾動頁面,將資料動態逐一顯示出
async function scrollPage(){

    let currentHeight = 0;//總高度currentHeight>offset,如果offset<currentHeight沒有資料可以繼續滾
    let offset = 0;//篇一輛

    while(offset <= currentHeight){
        currentHeight = await nightmare.evaluate(() => {
            return document.documentElement.scrollHeight;
        });
        offset += 500;
        //每次甜500是固定的沒有用所以需要累加
        await nightmare.scrollTo(offset,0).wait(500);
        console.log(`offset:${offset},currentHeight:${currentHeight}`);
        //接近底部時按下一夜
        //在刷剩下四次不到先幫按鈕
        if( (currentHeight - offset) < 2000 && await nightmare.exists('button.b-btn.b-btn--page.js-next-page')){
            await _checkPagination();
        }
    
    
    }
}

//按下一夜
async function _checkPagination(){
    await nightmare
    .wait('button.b-btn.b-btn--page.js-next-page')
    .click('button.b-btn.b-btn--page.js-next-page');
}

//分析整理,蒐集重要資訊
async function parseHtml(){
    console.log("分析整理,蒐集重要資訊");

    //取得滾動後得到動態產生結果的html元素
    let html = await nightmare.evaluate(()=>{
        return document.documentElement.innerHTML;
    });

    let obj = {};//宣告一個存放主要資訊的物件
    //將重要資訊放到陣列中,以便後續儲存
    //每一個part都是一個article
    $(html)
    .find('div#js-job-content article')
    .each((index,element)=>{
        let elm = $(element).find('div.b-block__left');

        let position = elm.find('h2.b-tit a.js-job-link').text();
        console.log(position);//職缺名稱
        let positionLink = 'https:' + elm.find('h2.b-tit a.js-job-link').attr('href');
        let location = elm.find('ul.b-list-inline.b-clearfix.job-list-intro.b-content li:eq(0)').text();
        let companyName = elm.find('ul.b-list-inline.b-clearfix li a').text().trim();
        let companyLink ='https:' + elm.find('ul.b-list-inline.b-clearfix li a').attr('href');
    
        let category = elm.find('ul.b-list-inline.b-clearfix li:eq(2)').text();

        obj.keyword = strKeyword;
        obj.position =position;
        obj.positionLink = positionLink;
        obj.location = location;
        obj.companyName = companyName;
        obj.companyLink = companyLink;
        obj.category = category;
        arrLink.push(obj);

        obj={};
    });
}

async function stepF() {
    //必須進行等待才能夠將影片完全載入wait()
    //class="style-scope ytd-video-primary-info-renderer"
    //<div id="count" class="style-scope ytd-video-primary-info-renderer"><yt-view-count-renderer class="style-scope ytd-video-primary-info-renderer" small_=""><span class="view-count style-scope yt-view-count-renderer">觀看次數：545,056次</span><span class="short-view-count style-scope yt-view-count-renderer">觀看次數：54萬次</span></yt-view-count-renderer></div>
    for(let i = 0; i < arrLink.length; i++){
        let html = await nightmare
        .goto(arrLink[i].positionLink)
        .wait('div.job-description-table.row div.row')
        .evaluate(() => {
            return document.documentElement.innerHTML;
        });

        let positionPlace = $(html)
        .find('div.job-description-table.row div.row.mb-2:eq(3) p.t3.mb-0')
       .text();

       arrLink[i].positionPlace = positionPlace;

       //植物類別
       let positionCategory = $(html)
       .find('div.job-description-table.row div.row.mb-2:eq(0) div.col.p-0.job-description-table__data')
      .text();

      arrLink[i].positionCategory = positionCategory;
    }
}
async function close(){
    await nightmare.end((err)=>{
        if(err){throw err;}
        console.log('nightmare is close');
    });
}

async function asyncArray(functionList){
    for(let func of functionList){
        await func();
    }
}

try {//丟陣列給 asyncArray
    asyncArray([search,setJobType,scrollPage,parseHtml,stepF,close]).then(async()=>{
        console.dir(arrLink,{depth:null});

        //若是檔案不存在則新增檔案同時寫入內容
        if ( !fs.existsSync(`downloads/104.json`) ) {
            await writeFile(`downloads/104.json`, JSON.stringify(arrLink,null,4))
        }

        console.log('Done')
    });
}catch(err){
throw(err)
} 