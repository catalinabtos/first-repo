#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
V4: Construye un único payload por ítem (cliente) y hace UN solo `op item edit`.
- Lee todas las filas del CSV del mismo item_title.
- Trae el ítem existente y *fusiona* secciones/campos sin tocar el par principal.
- Sección por cuenta (account_label) con campos 'usuario' (STRING) y 'contraseña' (CONCEALED).
- Evita sobrescrituras porque no hace múltiples edits secuenciales.
"""

import argparse, csv, json, os, subprocess, sys, collections, re, hashlib

def run(cmd, input_str=None):
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE if input_str else None,
                         stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    out, err = p.communicate(input_str)
    return p.returncode, out, err

def check_op():
    rc, _, _ = run(["op","--version"])
    if rc != 0:
        print("ERROR: 1Password CLI no disponible.", file=sys.stderr); sys.exit(2)

def get_item(vault, title):
    rc, out, err = run(["op","item","list","--vault", vault, "--format","json"])
    if rc != 0: raise RuntimeError(f"No pude listar ítems del vault '{vault}': {err.strip()}")
    for it in json.loads(out or "[]"):
        if it.get("title","").strip().lower() == title.strip().lower():
            rc2, out2, err2 = run(["op","item","get", it["id"], "--vault", vault, "--format","json"])
            if rc2 != 0: raise RuntimeError(f"No pude obtener item '{title}': {err2.strip()}")
            return json.loads(out2 or "{}")
    return None

def slugify(txt):
    s = re.sub(r"\s+", "-", (txt or "").strip().lower())
    s = re.sub(r"[^a-z0-9\-]", "", s)
    return s[:40] or "sec"

def infer_label(raw_label, username):
    base = "Login Cliente"
    raw = (raw_label or "").strip()
    if raw and raw != base: return raw
    u = (username or "").strip()
    for sep in ["_", "-", ".", "@"]: u = u.replace(sep, " ")
    toks = [t for t in u.split() if t]
    suf = toks[-1] if toks else ""
    return f"{base} ({suf})" if suf else base

def ensure_section(sections, label):
    sec_id = f"sec-{slugify(label)}-{hashlib.sha1(label.encode()).hexdigest()[:6]}"
    for s in sections:
        if s.get("label") == label:
            return sections, s.get("id") or sec_id
    sections.append({"id": sec_id, "label": label})
    return sections, sec_id

def merge_urls(existing_urls, url):
    urls = existing_urls[:] if existing_urls else []
    if url and url not in [u.get("href") for u in urls if u.get("href")]:
        urls.append({"href": url})
    return urls

def upsert_field(fields, section_id, label, value, ftype):
    """Reemplaza si existe (misma sección y label), si no, agrega."""
    if value is None or value == "": return fields
    for f in fields:
        if f.get("sectionId")==section_id and f.get("label")==label:
            f["value"] = value
            f["type"]  = ftype
            return fields
    fields.append({"type": ftype, "label": label, "value": value, "sectionId": section_id})
    return fields

def normalize_tags(*lists):
    tags = []
    for l in lists:
        if l: tags.extend([t.strip() for t in l if t and str(t).strip()])
    # quitar duplicados manteniendo orden
    seen = set(); out=[]
    for t in tags:
        if t not in seen:
            seen.add(t); out.append(t)
    return out

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", required=True)
    ap.add_argument("--dry-run", dest="dry_run", action="store_true")
    ap.add_argument("--require-both", dest="require_both", action="store_true",
                    help="Solo procesa filas con username y password.")
    args = ap.parse_args()

    check_op()

    # Leer CSV (coma; fallback ;)
    import io
    try:
        rows = list(csv.DictReader(open(args.csv, newline='', encoding="utf-8-sig")))
    except Exception:
        content = open(args.csv, encoding="latin-1").read()
        rows = list(csv.DictReader(io.StringIO(content), delimiter=";"))

    # Agrupar por (vault, item_title)
    groups = collections.defaultdict(list)
    for r in rows:
        vault = (r.get("vault_name") or "").strip()
        title = (r.get("item_title") or "").strip()
        if not vault or not title:
            print(f"[skip] Fila sin vault o item_title: {r}", file=sys.stderr)
            continue
        groups[(vault, title)].append(r)

    for (vault, title), items in groups.items():
        existing = get_item(vault, title)
        if not existing:
            print(f"[error] No existe el ítem '{title}' en vault '{vault}'. Crea el ítem base primero (o cambia el título).", file=sys.stderr)
            continue

        # Partimos del estado actual
        out_payload = {
            "sections": existing.get("sections") or [],
            "fields":   existing.get("fields")   or [],
            "urls":     existing.get("urls")     or [],
            "tags":     existing.get("tags")     or [],
        }

        # Construir un set de ediciones completas (UNA sola vez)
        for r in items:
            client   = (r.get("client_name") or "").strip()
            username = (r.get("username") or "").strip()
            password = (r.get("password") or "").strip()
            url      = (r.get("url") or "").strip()
            notes    = (r.get("notes") or "").strip()
            raw_lab  = (r.get("account_label") or "").strip()
            label    = infer_label(raw_lab, username)

            if args.require_both and (not username or not password):
                print(f"[skip] {label}: falta user o pass (require-both).")
                continue
            if not (username or password or notes or url):
                print(f"[skip] {label}: sin datos útiles.")
                continue

            # Sección para este label
            out_payload["sections"], sec_id = ensure_section(out_payload["sections"], label)

            # URLs
            out_payload["urls"] = merge_urls(out_payload["urls"], url)

            # Campos dentro de la sección (upsert por label)
            out_payload["fields"] = upsert_field(out_payload["fields"], sec_id, "usuario", username, "STRING")
            out_payload["fields"] = upsert_field(out_payload["fields"], sec_id, "contraseña", password, "CONCEALED")
            if notes:
                out_payload["fields"] = upsert_field(out_payload["fields"], sec_id, "nota", notes, "STRING")

            # Tags
            row_tags = [t.strip() for t in (r.get("tags","").split(",") if r.get("tags") else []) if t.strip()]
            if client:
                row_tags.append(f"client:{client}")
            out_payload["tags"] = normalize_tags(out_payload["tags"], row_tags)

        # Hacer UN solo edit
        if args.dry_run:
            print(f"[dry-run] EDITAR '{title}' en '{vault}' con {len(out_payload['sections'])} secciones y {len(out_payload['fields'])} campos.")
        else:
            payload_json = json.dumps(out_payload)
            rc, out, err = run(["op","item","edit", existing["id"], "--vault", vault, "--format","json","-"], payload_json)
            if rc != 0:
                print(f"[error] Editar '{title}': {err.strip()}", file=sys.stderr)
                continue
            edited = json.loads(out or "{}")
            print(f"[ok] Editado '{edited.get('title')}' (id={edited.get('id')}) con {len(out_payload['sections'])} secciones.")

if __name__ == "__main__":
    main()
