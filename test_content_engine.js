const { runContentEngine } = require('./lib/content-engine');

async function main() {
  console.log('🚀 Testing Content Engine...\n');
  
  try {
    const result = await runContentEngine({
      mode: 'preview',
      topicsPerRun: 3,
      maxRetries: 1,
    });
    
    console.log('\n✅ SUCCESS!\n');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n❌ ERROR:\n');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
  }
}

main();
