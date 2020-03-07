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
//放搜尋關鍵字用
let strKeyword = '張學友';


//對以下function做一些進階的事情
//放到陣列裡面去
//asyc裡面可以用await
//不是離散的方式而是照步驟所以必須使用asyc await
//照步驟執行
async function stepA(){
    try{
        if( !fs.existsSync(`downloads`)){
            //如果資料夾不存在就見資料夾
            fs.mkdirSync(`downloads`);
        }
    } catch(err){
        throw err;
    }
   
}
//搜尋關鍵字
async function stepB(){
    console.log(`準被搜尋`);

    //開始開啟nightmare

    await nightmare
    .goto('https://www.youtube.com',headers)
    .type('input[id="search"]',strKeyword)
    .click('button#search-icon-legacy')
    .catch((err)=>{
        console.error(err);
    });
}
//滾動頁面,將動態資料逐一顯示出來
async function stepC(){
    console.log('準備滾動葉面');
    
    let currentHeight = 0;//window裡面內容總高度
    let offset = 0;//總篇一輛

    //不斷地滾動直到沒有辦法在往下滾
    while(offset <= currentHeight){//<=總資料高度
        currentHeight = await nightmare.evaluate(()=>{
            return document.documentElement.scrollHeight;//回傳瀏覽器當前已滾高度
        });

        offset += 500;//a每次滾動500單位距離,offset需要累加才能對應到合適距離
        await nightmare.scrollTo(offset,0).wait(500);
        
        //設定停止
        if(offset > 2000){
            break;//滾動一段高度強迫跳出迴圈
        }
    }
}
//分析整理重要資訊
async function stepD(){
    console.log(`分析整理重要資訊`);
    
    //把一整包html變成字串並ˇ丟到jQ執行
    //youtube id會重複所以家class也可
    let html = await nightmare.evaluate(()=>{
        return document.documentElement.innerHTML;
    })

    let pattern = null;
    let arrMatch = null;
    let obj ={};
    //先抓縮圖連結

    $(html)
    .find('div#contents.style-scope.ytd-item-section-renderer ytd-video-renderer.style-scope.ytd-item-section-renderer')
    .each((index,element)=>{
        //找出縮圖連結和影片ID
        //<img id="img" class="style-scope yt-img-shadow" alt="" width="246" src="https://i.ytimg.com/vi/O9JBVray8Ic/hqdefault.jpg?sqp=-oaymwEZCNACELwBSFXyq4qpAwsIARUAAIhCGAFwAQ==&amp;rs=AOn4CLCs64uXeY45fIZUkv62KIAM0ry_eg">
        let linkOfImage = $(element).find('img#img.style-scope.yt-img-shadow').attr('src')
        pattern = /https:\/\/i\.ytimg\.com\/vi\/([a-zA-Z0-9_]{11})\/hqdefault\.jpg/g;
        if((arrMatch = pattern.exec(linkOfImage)) != null){
            obj.img =arrMatch[0];//縮圖連結
            obj.id = arrMatch[1];//從連結取出來的video id(watch?v=XXXX)

            //影片名稱<yt-formatted-string class="style-scope ytd-video-renderer" aria-label="張學友 Jacky Cheung –《等風雨經過》MV 上傳者：universalmusichk 2 天前 2 分鐘 55 秒 觀看次數：431,491次">張學友 Jacky Cheung –《等風雨經過》MV</yt-formatted-string>
           //<a id="video-title" class="yt-simple-endpoint style-scope ytd-video-renderer" title="張學友 Jacky Cheung –《等風雨經過》MV" href="/watch?v=O9JBVray8Ic" aria-label="張學友 Jacky Cheung –《等風雨經過》MV 上傳者：universalmusichk 2 天前 2 分鐘 55 秒 觀看次數：431,491次">
        //    <yt-formatted-string class="style-scope ytd-video-renderer" aria-label="張學友 Jacky Cheung –《等風雨經過》MV 上傳者：universalmusichk 2 天前 2 分鐘 55 秒 觀看次數：431,491次">張學友 Jacky Cheung –《等風雨經過》MV</yt-formatted-string>
        //    </a>
           
            let titleOfVideo = $(element)
            .find('a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer')
            .text();
            titleOfVideo = titleOfVideo.trim();
            obj.title = titleOfVideo;


            //影片連結
            let linkOfVideo =$(element)
            .find('a#video-title.yt-simple-endpoint.style-scope.ytd-video-renderer')
            .attr('href');

            linkOfVideo = 'https://www.youtube.com' + linkOfVideo;
            obj.link = linkOfVideo;

            //歌手名稱
            obj.singer = strKeyword;

            //收集整理各個影片連結元素資訊到全域陣列變數中

            arrLink.push(obj);

            //變數初始化
            obj = {};
        }
    });
}
//將續先前整理的陣列在繼續往下取得進階資訊

async function stepF() {
    //必須進行等待才能夠將影片完全載入wait()
    //class="style-scope ytd-video-primary-info-renderer"
    //<div id="count" class="style-scope ytd-video-primary-info-renderer"><yt-view-count-renderer class="style-scope ytd-video-primary-info-renderer" small_=""><span class="view-count style-scope yt-view-count-renderer">觀看次數：545,056次</span><span class="short-view-count style-scope yt-view-count-renderer">觀看次數：54萬次</span></yt-view-count-renderer></div>
    for(let i = 0; i < arrLink.length; i++){
        let html = await nightmare
        .goto(arrLink[i].link)
        .wait('div#count.style-scope.ytd-video-primary-info-renderer span.view-count.style-scope.yt-view-count-renderer')
        .evaluate(() => {
            return document.documentElement.innerHTML;
        });
        //觀看次數取得字串未整理
        let strPageView = $(html)
        .find('div#count.style-scope.ytd-video-primary-info-renderer span.view-count.style-scope.yt-view-count-renderer')
        .text();
        let regex = /[0-9,]+/g;
        let match = null;

        match = regex.exec(strPageView)
        strPageView = match[0];
        strPageView = strPageView.replace(/,/g,'');
        //剩下識字串的數字

        //取得案讚次數
        let strLikeCount = $(html).find("div#top-level-buttons yt-formatted-string#text:eq(0)").attr('aria-label');
        //<yt-formatted-string id="text" class="style-scope ytd-toggle-button-renderer style-text" aria-label="24,208 人表示喜歡">2.4萬</yt-formatted-string>
        regex = /[0-9,]+/g;
        console.log(strLikeCount)
        // match = null;
        match = regex.exec(strLikeCount)
        strLikeCount = match[0];
        strLikeCount = strLikeCount.replace(/,/g,'');
        //建立新屬性

        //<yt-formatted-string id="text" class="style-scope ytd-toggle-button-renderer style-text" aria-label="10,285 人不喜歡">1萬</yt-formatted-string>
        let strUnLikeCount = $(html).find("div#top-level-buttons yt-formatted-string#text:eq(1)").attr('aria-label');
        regex = /[0-9,]+/g;
        console.log(strUnLikeCount)
        // match = null;
        match = regex.exec(strUnLikeCount)
        strUnLikeCount = match[0];
        strUnLikeCount = strUnLikeCount.replace(/,/g,'');


        arrLink[i].pageView = parseInt(strPageView);
        arrLink[i].likeCount = parseInt(strLikeCount);
        arrLink[i].UnLikeCount = parseInt(strUnLikeCount);

    }
}

//關閉nightmare
async function stepE(){
    await nightmare.end((err)=>{
        if(err){throw err;}
        console.log('nightmare is close');
    });
}

//for of職帶到func
async function asyncArray(functionList){
    for(let func of functionList){
        await func();
    }
}

try {//丟陣列給 asyncArray
    asyncArray([stepA,stepB,stepC,stepD,stepF,stepE]).then(async()=>{
        console.dir(arrLink,{depth:null});

        //若是檔案不存在則新增檔案同時寫入內容
        if ( !fs.existsSync(`downloads/youtube.json`) ) {
            await writeFile(`downloads/youtube.json`, JSON.stringify(arrLink,null,4))
        }

        console.log('Done')
    });
}catch(err){

}
