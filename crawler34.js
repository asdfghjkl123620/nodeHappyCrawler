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


const headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
};

let arrLink = [];

let url = `https://zh.wikipedia.org/wiki/%E4%B8%89%E5%9B%BD%E6%BC%94%E4%B9%89%E8%A7%92%E8%89%B2%E5%88%97%E8%A1%A8`;

(
    async function(){}
    )();