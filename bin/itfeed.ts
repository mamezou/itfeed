#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ItfeedStack } from '../lib/itfeed-stack';

const app = new cdk.App();
new ItfeedStack(app, 'ItfeedStack');
