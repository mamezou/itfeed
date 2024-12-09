# AWS Blog & JVN Security Info Slack Notifier

このリポジトリは、AWS Step FunctionsとAWS Lambdaを活用して、以下の情報を定期的に取得し、Slackに通知するシステムです：

→ いつぞや勢いで書いたもので、そのまま動かしています。現状は以下の情報を取得します。

- **AWS公式ブログ**: 新しい記事や更新情報
- **JVN（Japan Vulnerability Notes）**: セキュリティ脆弱性情報

## 特徴
- **自動化**: 定期的に情報を取得してSlackに通知。
- **拡張性**: 追加の情報ソースや通知先を簡単にカスタマイズ可能。
- **サーバーレス設計**: AWSサービスを活用し、運用コストと管理負担を最小化。

## アーキテクチャ
1. **Step Functions**: ワークフロー全体を管理。
2. **Lambda関数**:
   - 情報取得（AWSブログやJVN APIからデータを取得）
   - データ整形（必要な情報を抽出）
   - Slack通知（Webhookを介して投稿）

## 必要な設定
以下の設定が必要です：

1. **Slack Webhook URL**
   - SlackのIncoming Webhooks機能を利用してWebhook URLを取得してください。
   - 環境変数 `SLACK_WEBHOOK_URL_VALUE` に設定します。

2. **AWSサービスの権限**
   - Lambda関数が必要なAPIにアクセスできるよう、適切なIAMロールを設定してください。


## デプロイ方法

このプロジェクトは[AWS CDK](https://aws.amazon.com/cdk/)を使用してデプロイします。AWS CDKを利用することで、インフラストラクチャをコードとして定義し、簡単にデプロイや管理が可能です。

### 手順

1. **リポジトリをクローンします**:
   ```bash
   git clone https://github.com/your-repository/aws-blog-jvn-notifier.git
   cd aws-blog-jvn-notifier

   依存関係をインストールします:
2. **プロジェクトで使用するNode.jsパッケージをインストールします。**
  ```bash
  npm install
  ```
3. **AWS CDKのセットアップ:
  AWS CDKがインストールされていない場合は、以下のコマンドでインストールしてください。
  ```bash
  npm install -g aws-cdk
  ```
4. **環境変数の設定:**
  Slack通知用のWebhook URLなど、必要な環境変数を設定します。これには、.env ファイルを作成するか、AWS Secrets Managerを使用してください。
  CDKスタックをデプロイします:
  初回デプロイ時にはCDKのブートストラップが必要です。
  ```bash
  cdk bootstrap
  ```
  次に、スタックをデプロイします。
  ```bash
  cdk deploy
  ```
5. **Slack通知の確認:**
  デプロイ後にLambda関数が実行され、Slackに通知が送信されることを確認してください。
