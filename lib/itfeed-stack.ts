import { Construct } from 'constructs';
import {
  Stack,
  StackProps,
  Duration,
  aws_lambda as lambda,
  aws_lambda_nodejs as nodeLambda,
  aws_stepfunctions as sfn,
  aws_stepfunctions_tasks as tasks,
  aws_sqs as sqs,
  aws_sns as sns,
  aws_ssm as ssm,
  aws_sns_subscriptions as subs,
  aws_events as events,
  aws_events_targets as targets,
} from 'aws-cdk-lib'

import * as path from 'path'

// WIP: Lambda_Path
const RSS = [
  { NAME: "getAWSWhatNewLambdaEN", LAMBDA_PATH: "../lambda/get-aws-whats-new-en.ts", TITLE: "AWS What's New(英語版)", URL: "https://aws.amazon.com/about-aws/whats-new/recent/feed/", LANG: "en" },
  { NAME: "getAWSWhatNewLambdaJA", LAMBDA_PATH: "../lambda/get-aws-whats-new-ja.ts", TITLE: "AWS What's New(日本語版)", URL: "https://aws.amazon.com/jp/about-aws/whats-new/recent/feed/", LANG: "ja" },
  { NAME: "getAWSNewsLambdaEN", LAMBDA_PATH: "../lambda/get-aws-news-en.ts", TITLE: "AWS News Blog(英語版)", URL: "https://aws.amazon.com/blogs/aws/feed/", LANG: "en" },
  { NAME: "getAWSNewsLambdaJA", LAMBDA_PATH: "../lambda/get-aws-news-ja.ts", TITLE: "Amazon Web Servicesブログ(日本語版)", URL: "https://aws.amazon.com/jp/blogs/news/feed/", LANG: "ja" },
]

const NOTIFY_SLACK_URL_VALUE = process.env.NOTIFY_SLACK_URL as string
const NOTIFY_SLACK_URL_NAME = 'NOTIFY_SLACK_URL'

export class ItfeedStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // create parameter to ParameterStore
    const slackUrlParam = new ssm.StringParameter(this, 'SlackUrlParam', {
      parameterName: NOTIFY_SLACK_URL_NAME,
      stringValue: NOTIFY_SLACK_URL_VALUE
    })

    // get news from aws(RSS)
    const rssLambdas = RSS.map((i) => {
      return new nodeLambda.NodejsFunction(this, i.NAME, {
        functionName: i.NAME,
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'handler',
        entry: path.join(__dirname, '../lambda/get-aws.ts'),
        timeout: Duration.seconds(30),
        memorySize: 128,
        environment: {
          URL: i.URL,
          LANG: i.LANG,
          TITLE: i.TITLE
        }
      })
    })

    // get jvn iPedia
    const getJvnLambda = new nodeLambda.NodejsFunction(this, 'GetJvnLambda', {
      functionName: 'GetJvnLambda',
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/get-jvn.ts'),
      timeout: Duration.seconds(30),
      memorySize: 128,
    });

    // notify slack
    const notifySlackLambda = new nodeLambda.NodejsFunction(this, 'NotifySlackLambda', {
      functionName: 'NotifySlackLambda',
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'handler',
      entry: path.join(__dirname, '../lambda/notify-slack.ts'),
      timeout: Duration.seconds(10),
      memorySize: 128,
      environment: {
        PARAMETER_STORE_NAME: NOTIFY_SLACK_URL_NAME
      }
    });

    slackUrlParam.grantRead(notifySlackLambda)

    // Event Bridge Rule
    const rule = new events.Rule(this, 'Rule', {
      // See https://docs.aws.amazon.com/lambda/latest/dg/tutorial-scheduled-events-schedule-expressions.html
      schedule: events.Schedule.expression('cron(0 0 ? * * *)')
    });

    // test
    // const queue = new sqs.Queue(this, 'ItfeedQueue', {
    //   visibilityTimeout: Duration.seconds(300)
    // });
    // const topic = new sns.Topic(this, 'ItfeedTopic');
    // topic.addSubscription(new subs.SqsSubscription(queue));

    // test
    // const pass1 = new sfn.Pass(this, 'pass1', {
    //   parameters: {
    //     val: 'クラス'
    //   },
    //   resultPath: '$.result',
    // })

    // test
    // const wait = new sfn.Wait(this, 'wait', {
    //   time: sfn.WaitTime.duration(Duration.seconds(30))
    // })

    const notifySlackLambdaTask01 = new tasks.LambdaInvoke(this, 'notifySlackLambdaTask01', {
      lambdaFunction: notifySlackLambda
    })
    const notifySlackLambdaTask02 = new tasks.LambdaInvoke(this, 'notifySlackLambdaTask02', {
      lambdaFunction: notifySlackLambda
    })
    const notifySlackLambdaTask03 = new tasks.LambdaInvoke(this, 'notifySlackLambdaTask03', {
      lambdaFunction: notifySlackLambda
    })
    const notifySlackLambdaTask04 = new tasks.LambdaInvoke(this, 'notifySlackLambdaTask04', {
      lambdaFunction: notifySlackLambda
    })

    // get aws news
    const [getAWSWhatNewLambdaENTask, getAWSWhatNewLambdaJATask, getAWSNewsLambdaENTask, getAWSNewsLambdaJATask] = [...rssLambdas.map((j) => {
      return new tasks.LambdaInvoke(this, `${j.functionName}Task`, {
        lambdaFunction: j
      })
    })]
    // const translateResultSelector: { [key: string]: string } = {
    //   "inputText.$": "$.TranslatedText"
    // }
    //// translate text
    // const translateTask = new tasks.CallAwsService(this, 'TranslateTask', {
    //   service: "Translate",
    //   action: "translateText",
    //   iamResources: ["*"],
    //   iamAction: "translate:TranslateText",
    //   parameters: {
    //     SourceLanguageCode: sfn.JsonPath.stringAt("$.sourceLang"),
    //     TargetLanguageCode: sfn.JsonPath.stringAt("$.targetLang"),
    //     Text: sfn.JsonPath.stringAt("$.inputText")
    //   },
    //   resultSelector: translateResultSelector
    // })

    const parallel = new sfn.Parallel(this, 'parallel');
    // parallel.branch(pass1);
    parallel.branch(getAWSNewsLambdaENTask.next(notifySlackLambdaTask01));
    parallel.branch(getAWSNewsLambdaJATask.next(notifySlackLambdaTask02))
    parallel.branch(getAWSWhatNewLambdaENTask.next(notifySlackLambdaTask03));
    parallel.branch(getAWSWhatNewLambdaJATask.next(notifySlackLambdaTask04));

    // TODO: Slack送信失敗時の対応処理 - StepFunctions
    // TODO: 記事がゼロ件（Payloadが空）のときはSlackに送らない処理

    const NotifyStateMachine = new sfn.StateMachine(this, 'NotifyStateMachine', {
      definition: parallel.next(new sfn.Succeed(this, "OK"))
    })
    rule.addTarget(new targets.SfnStateMachine(NotifyStateMachine))
  }
}
