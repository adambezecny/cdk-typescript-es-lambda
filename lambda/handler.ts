import { Tracer } from '@aws-lambda-powertools/tracer';

const tracer = new Tracer({ serviceName: 'eslambda' });

let initialized = false;

// Async initialization function
async function lambdaInit() {
  const segment = tracer.getSegment();
  segment?.addAnnotation("component", "lambdaInit");
  console.log('Starting async initialization...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('Async initialization completed');
  initialized = true;
  segment?.close();
}

// Call init function with top-level await
await lambdaInit();

export const handler = async (event: any) => {
  if (!initialized) {
     console.log("must initialize!") ;
     await lambdaInit();
     console.log("now initialized!") ;
  } else {
    console.log('already initialized!')
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from lambda with async init!!!!",
    }),
  };
};
