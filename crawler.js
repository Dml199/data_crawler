import { data } from "./stocks_by_mar_cap.js";
import url_list from "./url_list.js";
import cheerio from "cheerio"
import puppeteer from "puppeteer";
import url from "url"


const specs= {
  reuters:{BASE_URL:"https://www.reuters.com",
           selector_query:".search-results__list__2SxSK a",
           heading_query:".search-results__list__2SxSK header span"
  }
}
const $ = cheerio;


const browserURL = "http://127.0.0.1:5200";
const BASE_URL = "https://www.reuters.com"

const browser = await puppeteer.connect({ browserURL });


function get_company_name(from,to) {
  let arr_name = [];
  for (let i = from; i < to; ++i) {
    arr_name.push(data[i].Name);
  }
  return arr_name;
}

async function getPages(company) {
  const page =  await browser.newPage();
  await page.goto(url_list(company), { timeout: 0, waitUntil:"load"});
  const page_html=await page.content()
  return page_html;
}

 function fetchLinks (html_list){
const html_parse = html_list.map((doc)=>{return cheerio.load(doc)})
const URL_list=[]
const extract_link = html_parse.map((doc)=>{return doc(specs.reuters.selector_query).each((index,elem)=>{ URL_list.push($(elem).attr("href"))})})
const links_final = URL_list.map((href)=>{return url.resolve(BASE_URL,href)})
return links_final;
}


 function getArticles (html_list) {
const html_parse = html_list.map((html)=>{return cheerio.load(html)})
const article_list =[];
html_parse.map(async(html)=>{return html(specs.reuters.heading_query).each((index,elem)=>{return article_list.push($(elem).text())})})
return article_list
}

async function main() {
  const name_arr = get_company_name(0,3);
  const html_list = name_arr.map((name_arr)=>{return getPages(name_arr)})
  const resolved_html = await Promise.all(html_list)
  const links = fetchLinks(resolved_html)
  const headings = getArticles(resolved_html)
  console.log(links,headings)
  
  }


main();
