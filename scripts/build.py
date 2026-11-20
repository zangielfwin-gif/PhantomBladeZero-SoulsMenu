from pathlib import Path
from datetime import date
import hashlib
import json
import zipfile

ROOT = Path(__file__).resolve().parent.parent
META = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))
VERSION = META['version']
STAMP = date.fromisoformat(META['releaseDate'])
DIST = ROOT / 'dist'
MOD = ROOT / 'mod' / 'PBZSoulsMenu'
DIST.mkdir(exist_ok=True)

payload = {f.name: f.read_bytes() for f in sorted(MOD.iterdir()) if f.is_file() and (f.suffix == '.js' or f.name == 'settings.default.ini.example')}
assert 'main.js' in payload and 'accessories.js' in payload
for name in ['README.md', 'CONFIGURATION.md']:
    payload[name] = (ROOT / name).read_bytes()
manifest = {
    'id': 'PBZSoulsMenu', 'name': 'PBZ SoulsMenu', 'version': VERSION,
    'gameBuild': META['gameBuild'], 'requires': ['PBZModLoader'],
    'settings': 'GetProjectSavedDirectory()/PBZSoulsMenu.cfg',
    'files': {name: hashlib.sha256(data).hexdigest() for name, data in sorted(payload.items())}
}
payload['manifest.json'] = (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode('utf-8')

for kind, suffix, prefix in [
    ('Nexus', 'Nexus-Manual', 'ProjectPBZ/PBZModLoader/mods/PBZSoulsMenu/'),
    ('Heybox', 'Heybox', 'PBZSoulsMenu/')
]:
    stage = ROOT / '.build' / kind
    entries = {prefix + name: data for name, data in payload.items()}
    entries['README.md'] = (ROOT / 'README.md').read_bytes()
    for name, data in entries.items():
        target = stage / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    actual = {f.relative_to(stage).as_posix() for f in stage.rglob('*') if f.is_file()}
    if actual != set(entries):
        raise RuntimeError('Unexpected staging files. Inspect .build/' + kind + ' before building.')
    archive = DIST / f'PBZ_SoulsMenu-{VERSION}-{suffix}.zip'
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name, data in sorted(entries.items()):
            info = zipfile.ZipInfo(name, (STAMP.year, STAMP.month, STAMP.day, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            z.writestr(info, data)
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        installed = json.loads(z.read(prefix + 'manifest.json'))
        for name, checksum in installed['files'].items():
            assert hashlib.sha256(z.read(prefix + name)).hexdigest() == checksum
    print('PASS ZIP CRC and payload hashes:', archive.name)

for name in ['README.md', 'CONFIGURATION.md', 'NEXUS_DESCRIPTION.txt']:
    (DIST / name).write_bytes((ROOT / name).read_bytes())
(DIST / 'PBZSoulsMenu.cfg.example').write_bytes((MOD / 'settings.default.ini.example').read_bytes())
checksums = [hashlib.sha256(f.read_bytes()).hexdigest() + '  ' + f.name for f in sorted(DIST.iterdir()) if f.is_file() and f.name != 'SHA256SUMS.txt']
(DIST / 'SHA256SUMS.txt').write_text('\n'.join(checksums) + '\n', encoding='utf-8')
print('Built version', VERSION)
