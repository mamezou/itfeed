# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AWS serverless application that monitors AWS news feeds and JVN security vulnerabilities, sending daily notifications to Slack using Step Functions orchestration.

## Development Commands

```bash
# Build TypeScript
npm run build

# Watch mode for development
npm run watch

# Run tests
npm test

# Deploy to AWS
npm run cdk deploy

# Check CDK diff
npm run cdk diff

# Synthesize CloudFormation template
npm run cdk synth
```

## Architecture

The application follows an event-driven serverless pattern:

1. **EventBridge** triggers daily at midnight UTC
2. **Step Functions** orchestrates parallel execution of Lambda functions
3. **Lambda Functions** fetch data and send Slack notifications
4. **Parameter Store** manages the Slack webhook URL securely

### Key Components

- `lib/itfeed-stack.ts`: CDK infrastructure definition with Step Functions state machine
- `lambda/get-aws.ts`: Fetches and filters AWS RSS feeds (last 24 hours)
- `lambda/get-jvn.ts`: Fetches JVN security vulnerability data
- `lambda/notify-slack.ts`: Formats and sends Slack notifications using Block Kit

### State Machine Flow

The Step Functions state machine executes tasks in parallel:
- Fetches 4 AWS RSS feeds (English/Japanese What's New and News Blog)
- Fetches JVN security data
- Aggregates results and sends to Slack only if COUNT > 0

## Environment Configuration

Required Parameter Store entry:
- `/itfeed/slack-webhook-url`: Slack webhook URL for notifications

## Lambda Function Patterns

All Lambda functions follow this pattern:
- Export a `handler` function as the entry point
- Return objects with `COUNT` and data properties
- Use 24-hour time window for filtering content
- Handle errors gracefully with console.error logging

## Testing Approach

Tests use Jest with TypeScript support. The test configuration expects:
- Test files in `test/` directory with `.test.ts` extension
- AWS CDK test utilities for infrastructure testing
- Mock AWS services when testing Lambda functions