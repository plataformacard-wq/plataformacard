require("dotenv").config({ path: ".env.local" });

const VERCEL_API_URL = "https://api.vercel.com/v6/domains";

async function run() {
  const token = process.env.VERCEL_API_TOKEN;

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const domain = "lojateste1234.com.br";

  const response = await fetch(`${VERCEL_API_URL}/${domain}/config`, {
    method: "GET",
    headers,
  });

  const data = await response.json();
  console.log("Domain Config Response:");
  console.log(JSON.stringify(data, null, 2));
}

run().catch(console.error);
