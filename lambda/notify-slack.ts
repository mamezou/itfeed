import { Config, SSM } from "aws-sdk";
import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/webhook";
const PARAMETER_STORE_KEY = process.env.PARAMETER_STORE_NAME as string
const config = new Config
const ssm = new SSM

export const handler = async function (event: any) {
  console.log(event)
  const payload = event.Payload[1]
  const date = new Date();
  const displayDate = `${date.getFullYear()}年${(date.getMonth() + 1)}月${date.getDate()}日`;
  const Message: IncomingWebhookSendArguments = {
    blocks: [
      {
        type: "header",
        text: {
          type: 'plain_text',
          text: `${displayDate} | ${event.Payload[0].TITLE}は${event.Payload[0].COUNT}件のお知らせです`
        },
      }
    ],
    attachments: []
  }
  payload.map((i: any) => {
    Message.attachments?.push({
      pretext: `<${i.link}|${i.title}>`,
      text: i.contentSnippet
    })
  })


  try {
    config.update({ region: "ap-northeast-1" })
    const param = {
      Name: PARAMETER_STORE_KEY,
    }
    const ssmParam = await ssm.getParameter(param).promise();
    const ssmValue = ssmParam.Parameter?.Value as string
    const webhook = new IncomingWebhook(ssmValue)
    await webhook.send(Message)
  } catch (e) {
    console.log(e)
  }
}


