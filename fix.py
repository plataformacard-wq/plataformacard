import re

with open('app/cadastro/page.tsx', 'r') as f:
    content = f.read()

# Add Suspense import
content = content.replace('import { FormEvent, useState, useEffect } from "react";', 'import { FormEvent, useState, useEffect, Suspense } from "react";')

# Rename CadastroPage to CadastroContent
content = content.replace('export default function CadastroPage() {', 'function CadastroContent() {')

# Add the new export default at the bottom
new_export = """
export default function CadastroPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white flex items-center justify-center">
        <div className="text-zinc-400">Carregando...</div>
      </main>
    }>
      <CadastroContent />
    </Suspense>
  );
}
"""

content = content + new_export

with open('app/cadastro/page.tsx', 'w') as f:
    f.write(content)
