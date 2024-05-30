import { data } from "./stocks_by_mar_cap.js";
import url_list from "./url_list.js";
import cheerio from "cheerio"
import puppeteer from "puppeteer";
import url from "url"


const specs= {
  reuters:{BASE_URL:"https://www.reuters.com",
           selector_query:".search-results__list__2SxSK header a",
           heading_query:".search-results__list__2SxSK header span",
           time_query:".search-results__list__2SxSK time",
           article_query:".article-body__content__17Yit div.article-body__paragraph__2-BtD"
  },
   yahoo:{BASE_URL:"https://finance.yahoo.com",
          


   }
}
const $ = cheerio;


const browserURL = "http://127.0.0.1:5200";
const BASE_URL = "https://www.reuters.com"
let pages =[];
let counter = []
const browser = await puppeteer.connect({ browserURL });


function get_company_name(from,to) {
  let arr_name = [];
  for (let i = from; i < to; ++i) {
    arr_name.push(data[i].Name);
  }
  return arr_name;
}

async function getPages(company,url) {


  let content;
  if(typeof url === "function")
  {  const page =  await browser.newPage();
    pages.push(page)
    await page.goto(url(company), { timeout: 0, waitUntil:"load"});
    content = await page.content()
  }
  else{
      const page_ =await browser.newPage();
      pages.push(page_)
      await page_.goto(url,{ timeout: 0, waitUntil:"load"})
     content = await page_.content()
     }
    
  
  
  return content;
}

 function fetchLinks (html_list){
const html_parse = html_list.map((doc)=>{return cheerio.load(doc)})
const URL_list=[]
html_parse.map((doc)=>{counter.push(doc(specs.reuters.selector_query).length);return doc(specs.reuters.selector_query).each((index,elem)=>{URL_list.push($(elem).attr("href"))})})
const links_final = URL_list.map((href)=>{return url.resolve(BASE_URL,href)})
return links_final;
}


 function getHeading (html_list) {
const html_parse = html_list.map((html)=>{return cheerio.load(html)})
const article_list =[];
html_parse.map((html)=>{return html(specs.reuters.heading_query).each((index,elem)=>{article_list.push($(elem).text())})})
return article_list
}

function getTime (html_list) {
  const html_parse = html_list.map((html)=>{return cheerio.load(html)})
  const time_list =[];
  html_parse.map((html)=>{return html(specs.reuters.time_query).each((index,elem)=>{time_list.push($(elem).text())})})
  return time_list

}

async function getArticles(url,name_arr){
  const html_parse = url.map((url)=>{return getPages(name_arr,url)})
  const pages = await Promise.all(html_parse)
  
  const html_ = pages.map((html)=>{return cheerio.load(html)})
  const article_list =[];

  html_.map((html)=>{article_list.push(html(specs.reuters.article_query).text()) })

  return article_list
}

function Bundle(links, headings,time_list,article,company_list){
  const object_arr=[]
  let i = 0;
  let count = 0;
  let iter=counter[count];
  while (i<links.length)
{
    object_arr.push({company: company_list[count],
                     heading:headings[i],
                     link:links[i],
                     time:time_list[i],
                     article:article[i]

    })
    if(i===iter-1){count++;iter= iter + counter[count]}
    ++i
   }
return object_arr
}
async function closeTabs (tabs)
{
  tabs.map((tab)=>{tab.close()})
  await Promise.all(tabs);
  //clear memory from empty page instances
  pages=[];


  return 0


}
function checkForSimilarity(){

}

async function main() {
  const name_arr = get_company_name(8000,8002);
  const html_list = name_arr.map((name_arr)=>{return getPages(name_arr,url_list)})
  const resolved_html = await Promise.all(html_list)
  const links = fetchLinks(resolved_html)
  const headings = getHeading(resolved_html)
  const time_list = getTime(resolved_html)
  const articles = await getArticles(links,name_arr)
  const text = await Promise.all(articles)
  const obj = Bundle(links,headings,time_list,text,name_arr);
  console.log(obj)

  closeTabs(pages)

  }


main();
