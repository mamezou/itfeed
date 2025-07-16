import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Itfeed from '../lib/itfeed-stack';

describe('ItfeedStack', () => {
  let app: cdk.App;
  let template: Template;

  beforeAll(() => {
    app = new cdk.App();
    const stack = new Itfeed.ItfeedStack(app, 'MyTestStack');
    template = Template.fromStack(stack);
  });

  test('Lambda functions are created', () => {
    // Check that all Lambda functions are created
    template.resourceCountIs('AWS::Lambda::Function', 6); // 4 AWS RSS + 1 JVN + 1 Notify
  });

  test('Step Functions State Machine is created', () => {
    template.resourceCountIs('AWS::StepFunctions::StateMachine', 1);
  });

  test('EventBridge Rule is created with daily schedule', () => {
    template.hasResourceProperties('AWS::Events::Rule', {
      ScheduleExpression: 'cron(0 0 ? * * *)'
    });
  });

  test('Lambda functions use Node.js 20.x runtime', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      Runtime: 'nodejs20.x'
    });
  });

  test('Notify Lambda has environment variable for Parameter Store', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: 'NotifySlackLambda',
      Environment: {
        Variables: {
          PARAMETER_STORE_NAME: '/itfeed/slack-webhook-url'
        }
      }
    });
  });
});