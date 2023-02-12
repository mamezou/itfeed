import fetch from 'node-fetch'
import { XMLParser } from 'fast-xml-parser'
// Watch : https://jvn.jp/rss/
// コマンド例
// curl -G -d "method=getVulnOverviewList" -d "feed=hnd" https://jvndb.jvn.jp/myjvn
// curl -G -d "method=getVulnOverviewList" -d "feed=hnd"  -d "keyword=sudo" -d "datePublicStartY=2019" -d "rangeDatePublished=n" -d "rangeDateFirstPublished=n"  https://jvndb.jvn.jp/myjvn

// WIP
// const SEVERITY = ["low", "middle", "high"]
// const INTERVAL = ["daily", "weekly", "monthly"]
// const PRODUCTS = [
//   "Linux Kernel",
//   "OpenSSL",
//   "Apache HTTP Server",
//   "WordPress",
//   "Apache Tomcat"
// ]

const options = {
  ignoreAttributes: false,
  format: true
}
const parser = new XMLParser(options)

const URL_PATH = "https://jvndb.jvn.jp/myjvn"
const FEED = "hnd"
const VULN_OVERVIEW_LIST_METHOD = "getVulnOverviewList"
// WIP ?
// const PRODUCT_LIST_METHOD = "getProductList"
// const NS_STATUS = "http://jvndb.jvn.jp/myjvn/Status"
// const NS_SEC = "http://jvn.jp/rss/mod_sec/"
// const NS = "http://purl.org/rss/1.0/"
// const NS_PRODUCT = "http://jvndb.jvn.jp/myjvn/Results"

type JvnItemType = {
  title: string,
  link: string,
  description: string,
  ['sec:identifier']: string,
  ['dc:creator']: string
  ['dc:date']: string,
  ['sec:references']: Object[],
  ['sec:cpe']: Object,
  ['sec:cvss']: Object[],
  ['dcterms:issued']: string
  ['dcterms:modified']: string,
}

export const handler = async () => {
  const now = new Date();
  const targetTime = new Date(now.setDate(now.getDate() - 1)).getTime();
  const url = `${URL_PATH}?feed=${FEED}&method=${VULN_OVERVIEW_LIST_METHOD}`
  const res = await (await fetch(url)).text();
  const json = parser.parse(res)
  // JVNDB 脆弱性対策情報
  const title = json['rdf:RDF'].channel.title
  // 公開日時が24時間以内のもののみ抽出
  const items = json['rdf:RDF'].item.filter((i: JvnItemType) => {
    const putDate = new Date(i['dc:date']).getTime()
    return putDate >= targetTime
  })
  // Slack投稿用フォーマットに整形
  const meta = {
    URL: url,
    LANG: 'JA',
    TITLE: title,
    COUNT: items.length
  }
  const array = items.map((j: JvnItemType) => {
    return {
      title: j.title,
      link: j.link,
      contentSnippet: j.description
    }
  })
  console.log(`該当データは${items.length}件でした。`)
  return [meta, array]
}

// WIP
// const getProductIds = async (productNames: Array<string>) => {
//   const data = await Promise.all(productNames.map((i: string, idx: number) => {
//     // const url = `${URL_PATH}?feed=${FEED}&method${VULN_OVERVIEW_LIST_METHOD}&keyword${i}`
//     const url = `${URL_PATH}?feed=${FEED}&method=${VULN_OVERVIEW_LIST_METHOD}`
//   }))
//   return data
// }
