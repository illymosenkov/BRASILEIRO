#!/usr/bin/env python3
"""Package the Bora 4.3 web app in its existing Capacitor Android shell."""

import argparse
import json
import struct
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZIP_STORED, ZipFile, ZipInfo


def replace_once(data, previous, updated, encoding):
    old = previous.encode(encoding)
    new = updated.encode(encoding)
    if len(old) != len(new) or data.count(old) != 1:
        raise ValueError(f"Unexpected Android package structure for {previous!r}")
    return data.replace(old, new)


def manifest_for_side_by_side_install(data):
    # Keep the compiled MainActivity class and R namespace in civic41.
    for suffix in (".DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION", ".androidx-startup", ".fileprovider"):
        data = replace_once(data, "br.bora.civic41" + suffix, "br.bora.civic43" + suffix, "utf-16le")
    data = replace_once(data, "br.bora.civic41\0", "br.bora.civic43\0", "utf-16le")
    data = bytearray(replace_once(data, "4.2\0", "4.3\0", "utf-16le"))
    # The resource map identifies android:versionCode as attribute 0x0101021B.
    version_attribute = None
    chunk_offset = 8
    while chunk_offset < len(data):
        kind, header_size, chunk_size = struct.unpack_from("<HHI", data, chunk_offset)
        if kind == 0x0180:
            resource_ids = struct.iter_unpack(
                "<I", data[chunk_offset + header_size : chunk_offset + chunk_size]
            )
            version_attribute = next(i for i, (resource_id,) in enumerate(resource_ids)
                                     if resource_id == 0x0101021B)
        elif kind == 0x0102:
            attributes = chunk_offset + 16
            start, size, count = struct.unpack_from("<HHH", data, attributes + 8)
            for i in range(count):
                offset = attributes + start + i * size
                attribute = struct.unpack_from("<I", data, offset + 4)[0]
                if attribute == version_attribute:
                    struct.pack_into("<I", data, offset + 16, 404)
                    return data
            break
        chunk_offset += chunk_size
    raise ValueError("Android versionCode attribute was not found")


def write_entry(archive, name, data, compression):
    entry = ZipInfo(name, (1981, 1, 1, 1, 1, 0))
    entry.compress_type = compression
    if compression == ZIP_STORED:
        # Android maps stored resources directly, so align payloads to four bytes.
        offset = archive.fp.tell() + 30 + len(name.encode("utf-8"))
        if offset % 4:
            padding = -offset % 4
            entry.extra = struct.pack("<HH", 0xD935, padding) + bytes(padding)
    archive.writestr(entry, data)


def prepare(base, output, backup_dex):
    web = Path(__file__).with_name("web")
    replacements = {
        "assets/public/index.html": (web / "index.html").read_bytes(),
        "assets/public/extra-phrases.js": (web / "extra-phrases.js").read_bytes(),
        "classes5.dex": backup_dex.read_bytes(),
    }
    with ZipFile(base) as original:
        replacements["AndroidManifest.xml"] = manifest_for_side_by_side_install(
            original.read("AndroidManifest.xml")
        )
        replacements["resources.arsc"] = replace_once(
            original.read("resources.arsc"), "Bora 4.2", "Bora 4.3", "utf-8"
        )
        config = original.read("assets/capacitor.config.json")
        config = replace_once(config, "br.bora.civic41", "br.bora.civic43", "utf-8")
        replacements["assets/capacitor.config.json"] = replace_once(config, "Bora 4.2", "Bora 4.3", "utf-8")
        plugins = json.loads(original.read("assets/capacitor.plugins.json"))
        plugins.append({"classpath": "br.bora.civic41.BoraBackupPlugin"})
        replacements["assets/capacitor.plugins.json"] = json.dumps(plugins).encode()
        signatures = {"META-INF/MANIFEST.MF", "META-INF/CERT.SF", "META-INF/CERT.RSA"}
        with ZipFile(output, "w") as apk:
            for entry in original.infolist():
                if entry.filename in signatures:
                    continue
                data = replacements.pop(entry.filename, None)
                if data is None:
                    data = original.read(entry)
                write_entry(apk, entry.filename, data, entry.compress_type)
            for name, data in replacements.items():
                write_entry(apk, name, data, ZIP_DEFLATED)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("base", type=Path, help="Original Bora-Civic-v4.2.apk")
    parser.add_argument("output", type=Path, help="Unsigned Bora 4.3 APK")
    parser.add_argument("--backup-dex", type=Path, required=True, help="Compiled Android backup plugin")
    args = parser.parse_args()
    if args.base.resolve() == args.output.resolve():
        parser.error("Use a different path for the output APK")
    prepare(args.base, args.output, args.backup_dex)
