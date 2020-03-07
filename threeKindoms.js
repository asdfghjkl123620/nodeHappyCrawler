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

let arrLink = [];

let url = `https://zh.wikipedia.org/wiki/%E4%B8%89%E5%9B%BD%E6%BC%94%E4%B9%89%E8%A7%92%E8%89%B2%E5%88%97%E8%A1%A8`;
//如果用curl會抓不到jqueryUI套用的class
(
    async function(){
        //傳回來stdout內容量打小, {encoding: 'utf8', maxBuffer: 500 * 1024}
        let  {stdout, stderr} =  await exec(`curl -X GET ${url} -L -H "User-Agent: ${headers['User-Agent']}" -H "Accept: ${headers['Accept']}" -H "Accept-Language: ${headers['Accept-Language']}"`);

       //定義姓名人物連結 自 籍貫 列傳 手莫 使夠
       
       let wikiName = '', wikiLink = '', wikiAlias = '', wikiBirthplace = '', wikiDescription = '',wikiBeginEpisode = '',wikiEndEpisode = '',wikiEndIdt = '';
       //物件變數用來放置人物相關資訊
       let obj = {};

       //取得得人物表格element是table
       $(stdout).find('table.wikitable.sortable').each((index,element)=> {
           $(element).find('tbody tr').each((idx,elm)=> {
               //姓名
                wikiName =$(elm).find('td:eq(0)').text();

                wikiLink =$(elm).find('td:eq(0)').find('a').attr('href');

                wikiBirthplace = $(elm).find('td:eq(1)').text();
                wikiAlias = $(elm).find('td:eq(1)').text();

                wikiDescription = $(elm).find('td:eq(3)').text();
                wikiBeginEpisode = $(elm).find('td:eq(4)').text();
                wikiEndEpisode = $(elm).find('td:eq(5)').text();
                wikiEndIdt = $(elm).find('td:eq(6)').text();
            //弱勢變數沒有文字跳到下一行執行
                if(wikiName === '') return;
            obj = {
                name: wikiName,
                link: 'https://zh.wikipedia.org' + wikiLink,
                alias: wikiAlias,
                birthPlace: wikiBirthplace,
                BeginEpisode:wikiBeginEpisode,
                Description:wikiDescription,
                EndEpisode: wikiEndEpisode,
                identity: wikiEndIdt
            };
            //過濾不必要自原
            for(let key in obj) {
                let str = String(obj[key]);
                //讓他有字串特性
                obj[key] = str.replace(/\n/g,'');
            }



            //家入陣列變數
            arrLink.push(obj);
            //物件初始化
            obj = {};
            });
       })
   
       await fs.writeFileSync(`downloads/threeKindom.json`, JSON.stringify(arrLink, null, 4));

    }


)();