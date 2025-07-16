import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { IncomingWebhook, IncomingWebhookSendArguments } from "@slack/webhook";
const PARAMETER_STORE_KEY = process.env.PARAMETER_STORE_NAME as string
const ssmClient = new SSMClient({ region: "ap-northeast-1" });

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
    const command = new GetParameterCommand({
      Name: PARAMETER_STORE_KEY,
    });
    const response = await ssmClient.send(command);
    const ssmValue = response.Parameter?.Value as string
    const webhook = new IncomingWebhook(ssmValue)
    await webhook.send(Message)
  } catch (e) {
    console.log(e)
  }
}