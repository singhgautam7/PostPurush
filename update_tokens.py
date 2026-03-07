import os

replacements = {
    'bg-zinc-950': 'bg-background',
    'bg-zinc-900': 'bg-panel',
    'bg-zinc-800': 'bg-raised',
    'bg-zinc-700': 'bg-tab-active',
    'text-zinc-100': 'text-foreground',
    'text-zinc-400': 'text-foreground-muted',
    'text-zinc-600': 'text-foreground-subtle',
    'border-zinc-800': 'border-border',
    'border-zinc-700': 'border-border-subtle',
    
    'hover:bg-zinc-950': 'hover:bg-background',
    'hover:bg-zinc-900': 'hover:bg-panel',
    'hover:bg-zinc-800': 'hover:bg-raised',
    'hover:bg-zinc-700': 'hover:bg-tab-active',
    'hover:text-zinc-100': 'hover:text-foreground',
    'hover:text-zinc-400': 'hover:text-foreground-muted',
    'hover:text-zinc-600': 'hover:text-foreground-subtle',
    'hover:border-zinc-800': 'hover:border-border',
    'hover:border-zinc-700': 'hover:border-border-subtle',
}

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

search_dirs = ['components', 'features', 'app']

for d in search_dirs:
    for root, dirs, files in os.walk(d):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                process_file(os.path.join(root, file))
