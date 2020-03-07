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



//以上是設定nightmare

//先在外面宣告一個存放用的陣列
let arrLink = [];




//首頁:https://reurl.cc/20462v

//透過蒐集a連結裡面的link取回來
//再進行進一步的資料搜尋

async function ClickGoToSearchOne(){
    console.log('點進目錄進行基礎書目資料收集');
//ui-btn ui-btn-icon-right ui-icon-carat-r
const htmlBookName = await nightmare
.goto("https://reurl.cc/20462v",headers)
.wait(`a.ui-btn.ui-btn-icon-right.ui-icon-carat-r`)
.evaluate(()=>{
    return document.documentElement.innerHTML;
})

// console.log(htmlBookName);
//這裡取回html後做一些事情
//找到每一個目錄標題底下的a連結
//在a連結底下取回href
//方便後面進行遍歷

//進行網址處理,因為沒有直接進到可以點擊每個標頭的超連結所以,針對當中進行處理
//取得a連結底下的標及文字
//推到空物件裡面

//!!記得進行物件再次初始化不然會有資料覆蓋的情況
$(htmlBookName).find('a.ui-btn.ui-btn-icon-right.ui-icon-carat-r').each((idx,val)=>{
    let aLinkObj = {}
    aLinkObj.bookLink = `https://www.bookwormzz.com/${$(val).attr('href')}#book_toc`
    aLinkObj.bookTitleName = $(val).text()
    //資料推回原本的陣列
    arrLink.push(aLinkObj)

    aLinkObj= {}
});
// console.log(arrLink);
//確認取回來的link

//最後一個是聯繫作者我不需要!!!
//刪除陣列最後一個項目!
arrLink.pop();

}

//第二個步驟,我要取每個目錄#book_toc點進去的a連結資料
//還有小說標題
async function getAlinkInfoTwo(){
console.log(`我要取每個目錄#book_toc點進去的a連結資料`);

for(let i = 0; i < arrLink.length; i++) {
    //走這個陣列裡面每一個連結使用for迴圈
   const aLinkHtml = await nightmare
        .goto(arrLink[i].bookLink,headers)
        .wait(`div.ui-content div[data-theme="b"] ul li a`)
        .evaluate(()=>{
            return document.documentElement.innerHTML;
        });
        // console.log(aLinkHtml)//檢查
        //給他一個空陣列:方便放連結的資料

        arrLink[i].NovelLink = []
        

        $(aLinkHtml).find(`div.ui-content div[data-theme="b"] ul li a`).each((idx,val)=>{
            let novelObj = {}//初始化要推進去的物件
            novelObj.bookurl = `https://www.bookwormzz.com${$(val).attr('href')}`
            novelObj.bookUrlTitleName = $(val).text()
            //資料推回原本的陣列
            arrLink[i].NovelLink.push(novelObj)
        
            novelObj= {}
        });
    }

    console.log(`完成目錄下a連結的資訊蒐集`)
}


//第三個步驟點擊進去一個個抓小說每回內容

async function getContentThree(){
    //目前有兩層:外戀一層物件一個遍歷,裡面NovelLink
    //是另一個陣列裡面有物件所以要使用雙重for
    for(let i = 0 ; i < arrLink.length; i++){
        for(let y = 0 ; y < arrLink[i].NovelLink.length; y++){
            //div id="html" class="ui-content"
            let getContentHtml = await nightmare
                                .goto(arrLink[i].NovelLink[y].bookurl,headers)
                                .wait(`div#html.ui-content`)
                                .evaluate(()=>{
                                    return document.documentElement.innerHTML;
                                });
            //爪取下面那層div裡面的文字內容
            const article = $(getContentHtml).find(`div#html.ui-content div`).text()
            //空白取代\s是空白的正則
            arrLink[i].NovelLink[y].article = article.replace(/\s/g,'')
        }
    }
    console.log(`內容抓取完成`);

}







//nightmare該去睡囉!謝謝你
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
    asyncArray([ClickGoToSearchOne,getAlinkInfoTwo,getContentThree,close]).then(async()=>{
        console.dir(arrLink,{depth:null});

        //若是檔案不存在則新增檔案同時寫入內容
        if ( !fs.existsSync(`downloads/novel.json`) ) {
            await writeFile(`downloads/novel.json`, JSON.stringify(arrLink,null,4))
        }

        console.log('Done')
    });
}catch(err){
throw(err);
}