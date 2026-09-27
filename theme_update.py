import re

with open('frontend/src/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Font replacements
content = content.replace('family=Inter:', 'family=Roboto:')
content = content.replace("'Inter'", "'Roboto'")

# Background replacements
content = content.replace('#09090f', '#f8fafc')
content = content.replace('rgba(15,15,25,0.75)', 'rgba(255,255,255,0.75)')
content = content.replace('rgba(12,12,20,0.85)', 'rgba(255,255,255,0.85)')
content = content.replace('rgba(0,0,0,0.4)', 'rgba(241,245,249,0.8)')
content = content.replace('rgba(0,0,0,0.5)', 'rgba(241,245,249,0.9)')
content = content.replace('rgba(12,12,22,0.9)', 'rgba(255,255,255,1)')
content = content.replace('rgba(255,255,255,0.07)', 'rgba(0,0,0,0.07)')
content = content.replace('rgba(255,255,255,0.08)', 'rgba(0,0,0,0.08)')
content = content.replace('rgba(255,255,255,0.05)', 'rgba(0,0,0,0.05)')
content = content.replace('rgba(255,255,255,0.04)', 'rgba(0,0,0,0.04)')
content = content.replace('rgba(255,255,255,0.06)', 'rgba(0,0,0,0.06)')
content = content.replace('rgba(255,255,255,0.12)', 'rgba(0,0,0,0.12)')
content = content.replace('rgba(255,255,255,0.03)', 'rgba(0,0,0,0.03)')

# Text colors
content = content.replace('#e2e8f0', '#334155')
content = content.replace('#f1f5f9', '#0f172a')
content = content.replace('#f8fafc', '#0f172a')
content = content.replace('#cbd5e1', '#475569')
content = content.replace('#94a3b8', '#64748b')

with open('frontend/src/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
