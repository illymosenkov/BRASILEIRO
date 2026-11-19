"""Verify the packaged web sources, provider registration, app identity and the binary manifest."""
import hashlib
import json
from pathlib import Path
import struct
import sys
from zipfile import ZipFile

base, release = map(Path, sys.argv[1:3])
root=Path(__file__).resolve().parents[1]
with ZipFile(base) as old, ZipFile(release) as apk, release.open('rb') as raw:
    assert apk.testzip() is None
    assert len(apk.namelist()) == len(set(apk.namelist()))
    for p in (root/'www').iterdir():
        assert apk.read('assets/public/'+p.name) == p.read_bytes(), p.name
    cfg=json.loads(apk.read('assets/capacitor.config.json'))
    assert cfg['appId']=='br.bora.civic43' and cfg['appName']=='Bora 5.0'
    assert cfg['server']==json.loads(old.read('assets/capacitor.config.json'))['server']
    assert json.loads(apk.read('assets/capacitor.plugins.json'))==[{'classpath':'br.bora.civic41.BoraBackupPlugin'}]
    for name in ['classes.dex','classes2.dex','classes3.dex','classes4.dex']:
        assert apk.read(name)==old.read(name)
    assert b'BoraBackupPlugin' in apk.read('classes5.dex')
    manifest=apk.read('AndroidManifest.xml')
    assert '5.0\0'.encode('utf-16le') in manifest and 'br.bora.civic43\0'.encode('utf-16le') in manifest
    pos=8
    code=None
    while pos<len(manifest):
        typ,header,size=struct.unpack_from('<HHI',manifest,pos)
        if typ==0x0180: ids=[id[0] for id in struct.iter_unpack('<I',manifest[pos+header:pos+size])]
        if typ==0x0102:
            ext=pos+16
            start,stride,n=struct.unpack_from('<HHH',manifest,ext+8)
            for i in range(n):
                attr=ext+start+i*stride
                idx=struct.unpack_from('<I',manifest,attr+4)[0]
                if idx<len(ids) and ids[idx]==0x0101021B:code=struct.unpack_from('<I',manifest,attr+16)[0]
            break
        pos+=size
    assert code==500
    for info in apk.infolist():
        if info.compress_type==0:
            raw.seek(info.header_offset+26)
            name,extra=struct.unpack('<HH',raw.read(4))
            assert (info.header_offset+30+name+extra)%4==0, info.filename
print('APK: ZIP intact, assets match source, aligned stored resources, original native shell, backup DEX, app ID, versionCode 500 and 5.0 verified.')
