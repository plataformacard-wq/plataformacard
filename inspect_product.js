const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const envPath = path.resolve(process.cwd(), ".env.local");
let supabaseUrl = "";
let supabaseKey = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const lines = envContent.split("\n");
  for (const line of lines) {
    const parts = line.split("=");
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
      if (key === "NEXT_PUBLIC_SUPABASE_URL") supabaseUrl = val;
      if (key === "SUPABASE_SERVICE_ROLE_KEY") supabaseKey = val;
    }
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: config, error } = await supabase
    .from("platform_config")
    .select("*");

  if (error) {
    console.error("Erro ao buscar platform_config:", error);
  } else {
    console.log("Configurações encontradas:", JSON.stringify(config, null, 2));
  }
}

run();
