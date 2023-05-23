import Parser from 'rss-parser';

type AWSFeed = {
  creator: string
  title: string
  link: string
  pubDate: string
  author: string
  content: string
  contentSnippet: string
  guid: string
  categories: string[]
  isoDate: string
}

const parser: Parser = new Parser();

const URL = process.env.URL as string
const LANG = process.env.LANG as string
const TITLE = process.env.TITLE as string


export const handler = async () => {
  console.log(`${TITLE}の最新記事を取得します。`)
  const now = new Date();
  // 公開日時が1日以内のみ抽出
  const targetTime = new Date(now.setDate(now.getDate() - 1)).getTime();
  const feed = await parser.parseURL(URL);
  const news = feed.items.filter(item => {
    const putDate = new Date(item.pubDate!).getTime()
    return putDate >= targetTime
  })
  console.log(`該当データは${news.length}件でした。`)
  const meta = {
    URL,
    LANG,
    TITLE,
    COUNT: news.length
  }
  const array = news.map((i) => {
    return {
      title: i.title,
      link: i.link,
      contentSnippet: i.contentSnippet
    }
  })
  return [meta, array]
}
