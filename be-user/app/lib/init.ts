let isInitialized = false;

export async function initServices() {
  if (isInitialized) return;

  console.log("🚀 Initializing services...");

  await waitForES();

  isInitialized = true;
}

async function waitForES() {
  let ready = false;

  while (!ready) {
    try {
      await fetch(process.env.ELASTIC_URL || "http://localhost:9200");
      ready = true;
      console.log("✅ Elasticsearch ready");
    } catch {
      console.log("⏳ Waiting for Elasticsearch...");
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}