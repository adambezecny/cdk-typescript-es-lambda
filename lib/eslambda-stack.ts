import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime, Version, Alias } from 'aws-cdk-lib/aws-lambda';
import { RestApi, LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class EslambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaFunction = new NodejsFunction(this, 'EsModuleLambda', {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../lambda/handler.ts'),
      handler: 'handler',
      bundling: {
        format: cdk.aws_lambda_nodejs.OutputFormat.ESM,
        minify: false,
        sourceMap: true,
        banner: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
        esbuildArgs: {
          //'--conditions': 'module',  //not needed to suppor ES module, eve thoug AI thinks so:) cruicial is banner here!
          "--tree-shaking": "true",
        },
      },
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
      },
    });

    // Create an alias with provisioned concurrency
    const alias = new Alias(this, 'LambdaAlias', {
      aliasName: 'default',
      version: lambdaFunction.currentVersion,
      provisionedConcurrentExecutions: 1,
    });

    // Create API Gateway REST API
    const api = new RestApi(this, 'EsLambdaApi', {
      restApiName: 'ES Lambda Service',
      description: 'API Gateway for ES Module Lambda',
      deployOptions: {
        stageName: 'prod',
      },
    });

    // Create /test resource and add GET method with Lambda integration to alias
    const testResource = api.root.addResource('test');
    const lambdaIntegration = new LambdaIntegration(alias);
    testResource.addMethod('GET', lambdaIntegration);

    new cdk.CfnOutput(this, 'LambdaFunctionName', {
      value: lambdaFunction.functionName,
      description: 'Lambda function name',
    });

    new cdk.CfnOutput(this, 'LambdaAliasName', {
      value: alias.aliasName,
      description: 'Lambda alias name',
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'TestEndpoint', {
      value: `${api.url}test`,
      description: 'Test endpoint URL',
    });
  }
}
