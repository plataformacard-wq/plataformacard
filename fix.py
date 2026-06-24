import re

file_path = 'app/dashboard/perfil/page.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r'(\s*\{/\* Fim do Bloco de Identidade/Card \*/\})([\s\S]*)'
match = re.search(pattern, content)
if match:
    replacement = '''\\1
        </>
      )}

      {saveMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg transition-colors"
          style={{
            background: "var(--dash-surface)",
            borderColor: "var(--dash-border)",
            color: "var(--dash-text-primary)",
          }}
        >
          {saveMessage}
        </div>
      )}
      <ImageEditorModal
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        onConfirm={onImageEditorConfirm}
        aspectRatio={1}
        minWidth={400}
        minHeight={400}
      />
    </div>
  );
}

export default function PerfilPage() {
  return (
    <Suspense fallback={null}>
      <PerfilContent />
    </Suspense>
  );
}
'''
    new_content = content[:match.start()] + replacement
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('File fixed successfully')
else:
    print('Pattern not found')
