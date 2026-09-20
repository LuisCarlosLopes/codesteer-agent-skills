#!/usr/bin/env python3
"""Audit a Markdown cognitive base for front matter, link, and classification issues."""

from __future__ import annotations

import argparse
import glob
import json
import os
import re
import subprocess
import sys
from collections import defaultdict
from datetime import date
from typing import Any

ARTEFATOS = {
    "README.md",
    "index.md",
    "CONTRIBUTING.md",
    "glossary.md",
    "mindmap.md",
    "note.md",
}

PREFIXO_POR_QUADRANTE = {
    "decisions": "dec-",
    "specs": "spc-",
    "system": "sys-",
    "guides": "gd-",
    "ops": "ops-",
}

STATUS_VALIDOS = {"draft", "approved", "superseded"}

CAMPOS_OBRIGATORIOS = ("id", "type", "title", "status", "created", "author")

SECOES_AI_CORRECTION = [
    "O que aconteceu",
    "O que foi gerado",
    "O que deveria",
    "Por que a IA errou",
    "Como evitar",
]

SUBPASTAS_POR_TIPO_PROIBIDAS = {
    "adrs",
    "business-rules",
    "features",
    "use-cases",
    "runbooks",
    "incidents",
    "apis",
    "events",
}


def fm_field(fm: str, key: str, default: str = "") -> str:
    match = re.search(rf'^{key}:\s*"?(.+?)"?\s*$', fm, re.M)
    return match.group(1).strip('"').strip() if match else default


def discover_base(explicit: str | None) -> str:
    if explicit:
        if not os.path.isdir(explicit):
            print(f"Erro: diretório não encontrado: {explicit}", file=sys.stderr)
            sys.exit(1)
        return explicit

    try:
        result = subprocess.run(
            ["find", ".", "-maxdepth", "3", "-type", "d", "-name", "cognitive-base"],
            capture_output=True,
            text=True,
            check=False,
        )
        candidates = [line.strip() for line in result.stdout.splitlines() if line.strip()]
    except OSError:
        candidates = []

    if not candidates:
        default = "cognitive-base"
        if os.path.isdir(default):
            return default
        print("Erro: cognitive-base/ não encontrada. Rode cb-init primeiro.", file=sys.stderr)
        sys.exit(1)

    return candidates[0]


def quadrante_de(base: str, path: str) -> str:
    rel = os.path.relpath(path, base).replace("\\", "/")
    parts = rel.split("/")
    return parts[0] if len(parts) > 1 else ""


def collect_notas(base: str, achados: dict[str, list[str]]) -> list[dict[str, Any]]:
    notas: list[dict[str, Any]] = []

    for path in sorted(glob.glob(os.path.join(base, "**", "*.md"), recursive=True)):
        nome = os.path.basename(path)
        if nome in ARTEFATOS:
            continue

        with open(path, encoding="utf-8") as fh:
            content = fh.read()

        fm_match = re.search(r"^---\n(.*?)\n---", content, re.DOTALL)
        if not fm_match:
            achados["frontmatter"].append(f"SEM FRONT MATTER: {path}")
            continue
        fm = fm_match.group(1)

        for campo in CAMPOS_OBRIGATORIOS:
            if not re.search(rf"^{campo}:", fm, re.M):
                achados["frontmatter"].append(f"FALTA '{campo}': {path}")

        nome_curto = os.path.splitext(nome)[0]
        notas.append(
            {
                "path": path,
                "nome": nome_curto,
                "quadrante": quadrante_de(base, path),
                "id": fm_field(fm, "id"),
                "type": fm_field(fm, "type"),
                "status": fm_field(fm, "status"),
                "created": fm_field(fm, "created"),
                "updated": fm_field(fm, "updated"),
                "wikilinks": re.findall(r"\[\[([^\]|#]+)", content),
                "content": content,
            }
        )

    return notas


def check_ids_duplicados(notas: list[dict[str, Any]], achados: dict[str, list[str]]) -> None:
    contagem_id: dict[str, list[str]] = defaultdict(list)
    for n in notas:
        if n["id"]:
            contagem_id[n["id"]].append(n["path"])
    for id_, paths in contagem_id.items():
        if len(paths) > 1:
            achados["ids_duplicados"].append(f"{id_}: {', '.join(paths)}")


def check_prefixo_quadrante(notas: list[dict[str, Any]], achados: dict[str, list[str]]) -> None:
    for n in notas:
        prefixo = PREFIXO_POR_QUADRANTE.get(n["quadrante"])
        if prefixo and n["id"] and not n["id"].startswith(prefixo):
            achados["prefixo_errado"].append(
                f"{n['path']} (esperado '{prefixo}*', achou '{n['id']}')"
            )


def check_status_invalido(notas: list[dict[str, Any]], achados: dict[str, list[str]]) -> None:
    for n in notas:
        if n["status"] and n["status"] not in STATUS_VALIDOS:
            achados["status_invalido"].append(f"{n['path']}: status='{n['status']}'")


def check_wikilinks_quebrados(notas: list[dict[str, Any]], achados: dict[str, list[str]]) -> None:
    nomes_existentes = {n["nome"] for n in notas}
    nomes_existentes |= {os.path.splitext(artefato)[0] for artefato in ARTEFATOS}
    for n in notas:
        for i, linha in enumerate(n["content"].splitlines(), 1):
            for alvo in re.findall(r"\[\[([^\]|#]+)(?:[|#][^\]]*)?\]\]", linha):
                nome_alvo = os.path.splitext(os.path.basename(alvo.strip()))[0]
                if nome_alvo not in nomes_existentes:
                    achados["wikilinks_quebrados"].append(f"[[{alvo}]] em {n['path']}:{i}")


def check_notas_orfas(notas: list[dict[str, Any]], achados: dict[str, list[str]]) -> None:
    mencionados = {
        os.path.splitext(os.path.basename(wl))[0] for n in notas for wl in n["wikilinks"]
    }
    for n in notas:
        if n["nome"] not in mencionados and n["quadrante"] != "meta":
            achados["orfas"].append(n["path"])


def check_notas_estagnadas(notas: list[dict[str, Any]], achados: dict[str, list[str]]) -> str:
    hoje = date.today()
    for n in notas:
        data_ref = n["updated"] or n["created"]
        m = re.match(r"(\d{4})-(\d{2})-(\d{2})", data_ref or "")
        if not m:
            continue
        dias = (hoje - date(*map(int, m.groups()))).days
        if n["status"] == "draft" and dias > 30:
            achados["draft_estagnado"].append(f"{n['path']} ({dias} dias)")
        elif n["status"] == "approved" and dias > 90:
            achados["approved_sem_revisao"].append(f"{n['path']} ({dias} dias)")
    return str(hoje)


def check_subpasta_por_tipo(base: str, achados: dict[str, list[str]]) -> None:
    for d in glob.glob(os.path.join(base, "**", ""), recursive=True):
        nome_dir = d.rstrip("/").split("/")[-1].lower()
        if nome_dir in SUBPASTAS_POR_TIPO_PROIBIDAS:
            achados["subpasta_por_tipo"].append(d)


def check_adr_sem_howto(notas: list[dict[str, Any]], achados: dict[str, list[str]]) -> None:
    ids_guides_mencionados = {
        os.path.splitext(os.path.basename(wl))[0]
        for n in notas
        if n["quadrante"] == "guides"
        for wl in n["wikilinks"]
    }
    for n in notas:
        if n["quadrante"] == "decisions" and n["type"] in ("adr", "dev-pattern"):
            if n["nome"] not in ids_guides_mencionados:
                achados["adr_sem_howto"].append(n["path"])


def check_ai_correction_incompleta(
    notas: list[dict[str, Any]], achados: dict[str, list[str]]
) -> None:
    for n in notas:
        if n["type"] == "ai-correction":
            for secao in SECOES_AI_CORRECTION:
                if secao not in n["content"]:
                    achados["ai_correction_incompleta"].append(f"{n['path']}: falta '{secao}'")


def run_checks(base: str) -> dict[str, Any]:
    achados: dict[str, list[str]] = defaultdict(list)
    notas = collect_notas(base, achados)

    check_ids_duplicados(notas, achados)
    check_prefixo_quadrante(notas, achados)
    check_status_invalido(notas, achados)
    check_wikilinks_quebrados(notas, achados)
    check_notas_orfas(notas, achados)
    hoje = check_notas_estagnadas(notas, achados)
    check_subpasta_por_tipo(base, achados)
    check_adr_sem_howto(notas, achados)
    check_ai_correction_incompleta(notas, achados)

    return {"hoje": hoje, "total": len(notas), **achados}


CRITICAL_KEYS = ("frontmatter", "ids_duplicados", "wikilinks_quebrados")


def main() -> None:
    parser = argparse.ArgumentParser(description="Audit a Markdown cognitive base")
    parser.add_argument("--base", help="Path to cognitive-base directory")
    parser.add_argument(
        "--fail-on",
        choices=("critical", "any"),
        help="Exit 1 when findings match the threshold (critical: front matter, IDs duplicados, wikilinks quebrados)",
    )
    args = parser.parse_args()

    base = discover_base(args.base)
    result = run_checks(base)
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if args.fail_on == "critical":
        if any(result.get(key) for key in CRITICAL_KEYS):
            sys.exit(1)
    elif args.fail_on == "any":
        if any(value for value in result.values() if isinstance(value, list) and value):
            sys.exit(1)


if __name__ == "__main__":
    main()
