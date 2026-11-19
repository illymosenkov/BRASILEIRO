"""Rebuild Bora 5.0 from the original signed 4.3 Capacitor shell and updated web sources."""
import argparse
import hashlib
import json
import struct
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
from prepare_43 import write_entry, replace_once

ROOT = Path(__file__).resolve().parents[1]
BASE_SHA = '776214417489f44e66e557e95392bb72e16937529c40400f4c1adfa17607aaf4'

def manifest_version(data):
    data = bytearray(replace_once(data, '4.3\0', '5.0\0', 'utf-16le'))
    offset = 8
    version_attribute = None
    while offset < len(data):
        kind, header, size = struct.unpack_from('<HHI', data, offset)
        if kind == 0x0180:
            ids = list(struct.iter_unpack('<I', data[offset+header:offset+size]))
            version_attribute = ids.index((0x0101021B,))
        if kind == 0x0102:
            node = offset + 16
            start, stride, count = struct.unpack_from('<HHH', data, node+8)
            for i in range(count):
                attr = node + start + i*stride
                if struct.unpack_from('<I', data, attr+4)[0] == version_attribute:
                    assert struct.unpack_from('<I', data, attr+16)[0] == 404
                    struct.pack_into('<I', data, attr+16, 500)
                    return data
        offset += size
    raise ValueError('Version attribute missing')

def package(base, output, plugin):
    if hashlib.sha256(base.read_bytes()).hexdigest() != BASE_SHA:
        raise ValueError('The shell must be the original verified Bora Civic 4.3 APK')
    with ZipFile(base) as source, ZipFile(output,'w') as target:
        assets = {'assets/public/'+p.name:p.read_bytes() for p in (ROOT/'www').iterdir() if p.is_file()}
        assets['AndroidManifest.xml'] = manifest_version(source.read('AndroidManifest.xml'))
        assets['assets/capacitor.config.json'] = (ROOT/'capacitor.config.json').read_bytes()
        assets['resources.arsc'] = replace_once(source.read('resources.arsc'),'Bora 4.3','Bora 5.0','utf-8')
        assets['classes5.dex'] = plugin.read_bytes()
        for info in source.infolist():
            name = info.filename
            if name.startswith('META-INF/') and (name.endswith(('.SF','.RSA','.DSA','.EC')) or name=='META-INF/MANIFEST.MF'):
                continue
            data = assets.pop(name) if name in assets else source.read(name)
            write_entry(target,name,data,info.compress_type)
        for name, data in assets.items():
            write_entry(target,name,data,ZIP_DEFLATED)

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    for arg in ('base','output','plugin'):
        parser.add_argument(arg,type=Path)
    args=parser.parse_args()
    if args.output.resolve() in {args.base.resolve(),args.plugin.resolve()}:
        parser.error('Use a separate output path')
    package(args.base,args.output,args.plugin)
