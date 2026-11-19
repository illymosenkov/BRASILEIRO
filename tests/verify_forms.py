"""Check the complete shipped table against individual PT-BR dictionary entries.
Usage: python tests/verify_forms.py DIRECTORY (verbo-INF pages stored as INF.html).
"""
import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
data = json.loads((root/'www/paradigms.js').read_text().split(' = ', 1)[1].strip().rstrip(';'))
titles = ['Presente', 'Pretérito Perfeito', 'Pretérito Imperfeito', 'Futuro do Presente', 'Futuro do Pretérito', 'Presente']
for verb, table in data.items():
    source = (Path(sys.argv[1])/(verb+'.html')).read_text()
    groups = re.findall(r'<h4[^>]*>(.*?)</h4>\s*<p>(.*?)</p>', source, re.S)
    for idx, group in enumerate([0, 2, 1, 4, 5, 6]):
        title, body = groups[group]
        assert title == titles[idx], (verb, title)
        forms = re.findall(r'<span class="f[^"]*">([^<]+)</span>', body)
        assert len(forms) == 6 and table[idx].split() == [forms[i] for i in (0,2,3,5)], (verb, title, forms)
assert len(data) == 50
print('50 verbs × 6 simple tenses × 4 distinct persons verified against Conjugação.')
