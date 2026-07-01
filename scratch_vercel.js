require("dotenv").config({ path: ".env.local" });

const VERCEL_API_URL = "https://api.vercel.com/v9/projects";

async function run() {
  const projectId = process.env.VERCEL_PROJECT_ID;
  const token = process.env.VERCEL_API_TOKEN;

  console.log("ProjectId:", projectId);
  
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const domain = "lojateste1234.com.br";

  const response = await fetch(`${VERCEL_API_URL}/${projectId}/domains/${domain}`, {
    method: "GET",
    headers,
  });

  const data = await response.json();
  console.log("Domain Status Response:");
  console.log(JSON.stringify(data, null, 2));
}

run().catch(console.error);
