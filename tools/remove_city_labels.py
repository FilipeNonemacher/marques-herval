"""Simplify the current map while preserving its cartographic geometry."""

from __future__ import annotations

import argparse
import base64
import io
import json
import tempfile
import unicodedata
from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream


# Municipalities with population roughly equal to or greater than Sao Luiz
# Gonzaga. Larger state centres use a separate typographic tier in the source
# and are preserved automatically.
KEEP_MEDIUM_CITIES = {
    "alegrete", "cachoeira do sul", "camaqua", "campo bom", "canela",
    "capao da canoa", "carazinho", "charqueadas", "cruz alta",
    "dom pedrito", "eldorado do sul", "estancia velha", "farroupilha",
    "garibaldi", "gramado", "guaiba", "igrejinha", "itaqui", "lajeado",
    "marau", "montenegro", "osorio", "panambi", "parobe", "portao",
    "rio pardo", "rosario do sul", "santa rosa", "santana do livramento",
    "santiago", "santo angelo", "sao borja", "sao gabriel",
    "sao lourenco do sul", "sao luiz gonzaga", "sapiranga", "taquara",
    "torres", "tramandai", "vacaria", "venancio aires",
}


def normalize_label(value: object) -> str:
    """Normalize the PDF's custom single-byte accent encoding for matching."""
    text = "".join(" " if ord(char) < 32 else char for char in str(value))
    text = unicodedata.normalize("NFKD", text)
    text = "".join(char for char in text if not unicodedata.combining(char))
    return " ".join(text.lower().split())


def consonant_key(value: str) -> str:
    return "".join(char for char in value if char.isascii() and char.isalnum() and char not in "aeiou")


def is_kept_city(label: str) -> bool:
    if label in KEEP_MEDIUM_CITIES:
        return True
    # The source PDF represents accented letters as control bytes. Comparing
    # consonant skeletons retains names such as Sao Luiz Gonzaga. The two
    # cedilla names need explicit aliases because that consonant is encoded as
    # a control byte rather than a printable character.
    key = consonant_key(label)
    keep_keys = {consonant_key(city) for city in KEEP_MEDIUM_CITIES}
    return key in keep_keys or key in {"cng", "slrndsl"}


def shown_text(operands: list[object], operator: bytes) -> str:
    if not operands:
        return ""
    if operator == b"TJ":
        return "".join(str(item) for item in operands[0] if not isinstance(item, (int, float)))
    return str(operands[0])


def build_clean_pdf(source: Path, destination: Path) -> tuple[int, int]:
    reader = PdfReader(source)
    page = reader.pages[0]
    content = ContentStream(page.get_contents(), reader)
    current_font_size = 0.0
    removed_cities = 0
    removed_lajeados = 0
    cleaned_operations = []

    for operands, operator in content.operations:
        if operator == b"Tf":
            current_font_size = float(operands[1])

        remove = False
        if operator in {b"Tj", b"TJ", b"'", b'"'}:
            label = normalize_label(shown_text(operands, operator))
            # Hydrographic captions are the small 8-point tier. This avoids
            # confusing the municipality of Lajeado with a watercourse.
            if current_font_size <= 8.1 and "lajeado" in label:
                removed_lajeados += 1
                remove = True
            # Municipal captions use the 17-point tier. Major cities are a
            # larger tier and therefore pass through unchanged.
            elif 16.9 <= current_font_size <= 17.1 and not is_kept_city(label):
                removed_cities += 1
                remove = True

        if not remove:
            cleaned_operations.append((operands, operator))

    content.operations = cleaned_operations
    page.replace_contents(content)
    writer = PdfWriter()
    writer.add_page(page)
    with destination.open("wb") as output:
        writer.write(output)
    return removed_cities, removed_lajeados


def render_site_asset(source_pdf: Path, destination_png: Path) -> tuple[int, int]:
    document = pdfium.PdfDocument(source_pdf)
    page = document[0]
    width, height = page.get_size()
    rendered = page.render(scale=8000 / max(width, height)).to_pil().convert("RGB")
    if rendered.size != (8000, 8000):
        rendered = rendered.resize((8000, 8000), Image.Resampling.LANCZOS)
    destination_png.parent.mkdir(parents=True, exist_ok=True)
    rendered.save(destination_png, format="PNG", optimize=True)
    page.close()
    document.close()
    return rendered.size


def generate_delivery_assets(image_path: Path, assets_dir: Path, manifest_path: Path) -> None:
    image = Image.open(image_path).convert("RGB")
    tile_root = assets_dir / "map-tiles" / "modern"
    for level in (1024, 2048, 4096, 8000):
        level_image = image if level == 8000 else image.resize((level, level), Image.Resampling.LANCZOS)
        level_dir = tile_root / str(level)
        level_dir.mkdir(parents=True, exist_ok=True)
        count = (level + 511) // 512
        for row in range(count):
            for col in range(count):
                box = (col * 512, row * 512, min((col + 1) * 512, level), min((row + 1) * 512, level))
                level_image.crop(box).save(level_dir / f"{col}-{row}.webp", "WEBP", quality=88, method=6)

    preview = image.resize((1600, 1600), Image.Resampling.LANCZOS)
    preview.save(assets_dir / "map-modern-preview.webp", "WEBP", quality=84, method=6)
    tiny = image.resize((256, 256), Image.Resampling.LANCZOS)
    buffer = io.BytesIO()
    tiny.save(buffer, "JPEG", quality=62, optimize=True)
    tiny_url = "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")

    prefix = "window.MAP_ASSETS = "
    text = manifest_path.read_text(encoding="utf-8")
    prefix_at = text.index(prefix)
    header = text[:prefix_at]
    manifest = json.loads(text[prefix_at + len(prefix):].rstrip().rstrip(";"))
    manifest["modern"]["tiny"] = tiny_url
    manifest_path.write_text(header + prefix + json.dumps(manifest, separators=(",", ":")) + ";\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--assets-dir", type=Path)
    parser.add_argument("--manifest", type=Path)
    args = parser.parse_args()

    with tempfile.TemporaryDirectory(prefix="expedicao-map-") as temp_dir:
        clean_pdf = Path(temp_dir) / "mapa-simplificado.pdf"
        cities, lajeados = build_clean_pdf(args.source, clean_pdf)
        width, height = render_site_asset(clean_pdf, args.destination)
    if args.assets_dir and args.manifest:
        generate_delivery_assets(args.destination, args.assets_dir, args.manifest)

    print(f"Removed {cities} municipal-label and {lajeados} lajeado text operations")
    print(f"Rendered {width}x{height}: {args.destination}")


if __name__ == "__main__":
    main()
