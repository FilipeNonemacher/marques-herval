"""Simplify the current map while preserving its cartographic geometry."""

from __future__ import annotations

import argparse
import base64
import io
import json
import math
import tempfile
import unicodedata
from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream
from reportlab.lib.colors import HexColor
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


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

# This oversized river caption conflicts with the Porto Maua callout. The PDF
# draws every label twice (white outline, then blue fill), at the same origin.
PORTO_MAUA_URUGUAI_LABEL_ORIGIN = (2264.967, 5239.829)
MODERN_ASSET_REVISION = "102"
TILE_SIZE = 512
HIGH_DENSITY_LEVELS = (16000, 32000)
VECTOR_RENDER_BLOCK_TILES = 4
OFFICIAL_ROADS = Path(__file__).parent / "data" / "daer-rs-sistema-viario-2026-04.geojson"

# The former road layer came from OpenStreetMap and was drawn as four paired
# ochre strokes. Removing these exact vector colors leaves the official IBGE
# boundaries and the hydrographic layer untouched.
LEGACY_ROAD_STROKES = {
    (0.8392, 0.6588, 0.3216),
    (0.9765, 0.8706, 0.6275),
    (0.8157, 0.6863, 0.4392),
    (0.9765, 0.8980, 0.6863),
    (0.7882, 0.7176, 0.5412),
    (0.9804, 0.9255, 0.8000),
    (0.8314, 0.6235, 0.2980),
    (0.9608, 0.8314, 0.5216),
}
PATH_OPERATORS = {b"m", b"l", b"c", b"v", b"y", b"h", b"re"}
PATH_END_OPERATORS = {b"S", b"s", b"f", b"F", b"f*", b"B", b"B*", b"b", b"b*", b"n"}

# Official SIRGAS 2000 / Brazil Polyconic coordinates for the state boundary,
# mapped onto the unchanged vector-map frame in the 6000 x 6000 source PDF.
STATE_PROJECTED_BOUNDS = (4649071.607173386, 6263739.443652131, 5421250.39597077, 7003145.01429908)
STATE_PDF_BOUNDS = (182.6, 220.0, 5817.4, 5610.0)


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


def build_clean_pdf(source: Path, destination: Path) -> tuple[int, int, int, int, int]:
    reader = PdfReader(source)
    writer = PdfWriter()
    writer.append_pages_from_reader(reader)
    page = writer.pages[0]
    content = ContentStream(page.get_contents(), writer)
    current_font_size = 0.0
    removed_cities = 0
    removed_lajeados = 0
    removed_uruguai_labels = 0
    removed_route_labels = 0
    removed_road_paths = 0
    text_origin: tuple[float, float] | None = None
    stroke_color: tuple[float, ...] | None = None
    stroke_stack: list[tuple[float, ...] | None] = []
    cleaned_operations = []
    pending_path = []

    for operands, operator in content.operations:
        if operator in PATH_OPERATORS:
            pending_path.append((operands, operator))
            continue

        if operator in PATH_END_OPERATORS:
            if stroke_color in LEGACY_ROAD_STROKES:
                pending_path.clear()
                if operator in {b"S", b"s", b"B", b"B*", b"b", b"b*"}:
                    removed_road_paths += 1
                continue
            cleaned_operations.extend(pending_path)
            pending_path.clear()
            cleaned_operations.append((operands, operator))
            continue

        if pending_path:
            cleaned_operations.extend(pending_path)
            pending_path.clear()

        if operator == b"q":
            stroke_stack.append(stroke_color)
        elif operator == b"Q":
            stroke_color = stroke_stack.pop() if stroke_stack else None
        elif operator == b"RG":
            stroke_color = tuple(round(float(value), 4) for value in operands)

        if operator == b"Tf":
            current_font_size = float(operands[1])
        elif operator == b"Tm":
            text_origin = (float(operands[4]), float(operands[5]))

        remove = False
        if operator in {b"Tj", b"TJ", b"'", b'"'}:
            label = normalize_label(shown_text(operands, operator))
            if abs(current_font_size - 7.0) < 0.1:
                removed_route_labels += 1
                remove = True
            # Hydrographic captions are the small 8-point tier. This avoids
            # confusing the municipality of Lajeado with a watercourse.
            elif current_font_size <= 8.1 and "lajeado" in label:
                removed_lajeados += 1
                remove = True
            # Municipal captions use the 17-point tier. Major cities are a
            # larger tier and therefore pass through unchanged.
            elif 16.9 <= current_font_size <= 17.1 and not is_kept_city(label):
                removed_cities += 1
                remove = True
            elif label == "rio uruguai" and text_origin is not None:
                target_x, target_y = PORTO_MAUA_URUGUAI_LABEL_ORIGIN
                if abs(text_origin[0] - target_x) < 0.01 and abs(text_origin[1] - target_y) < 0.01:
                    removed_uruguai_labels += 1
                    remove = True
            elif "sirgas 2000" in label or "openstreetmap" in label:
                remove = True

        if not remove:
            cleaned_operations.append((operands, operator))

    cleaned_operations.extend(pending_path)

    content.operations = cleaned_operations
    page.replace_contents(content)
    with destination.open("wb") as output:
        writer.write(output)
    return (
        removed_cities,
        removed_lajeados,
        removed_uruguai_labels,
        removed_route_labels,
        removed_road_paths,
    )


def projected_to_pdf(easting: float, northing: float) -> tuple[float, float]:
    west, south, east, north = STATE_PROJECTED_BOUNDS
    left, bottom, right, top = STATE_PDF_BOUNDS
    x = left + (easting - west) * (right - left) / (east - west)
    y = bottom + (northing - south) * (top - bottom) / (north - south)
    return x, y


def route_label(code: str) -> str | None:
    if len(code) < 6:
        return None
    prefix = {"B": "BR", "E": "ERS"}.get(code[3])
    return f"{prefix}-{code[:3]}" if prefix else None


def polyline_length(points: list[tuple[float, float]]) -> float:
    return sum(math.hypot(x2 - x1, y2 - y1) for (x1, y1), (x2, y2) in zip(points, points[1:]))


def point_along(points: list[tuple[float, float]], fraction: float) -> tuple[float, float]:
    target = polyline_length(points) * fraction
    traversed = 0.0
    for (x1, y1), (x2, y2) in zip(points, points[1:]):
        segment = math.hypot(x2 - x1, y2 - y1)
        if traversed + segment >= target and segment:
            ratio = (target - traversed) / segment
            return x1 + (x2 - x1) * ratio, y1 + (y2 - y1) * ratio
        traversed += segment
    return points[-1]


def draw_grouped_paths(
    pdf: canvas.Canvas,
    groups: dict[tuple[str, str], list[list[tuple[float, float]]]],
    casing: bool,
) -> None:
    for (network, status), polylines in groups.items():
        federal = network == "federal"
        is_planned = "planejada" in status
        is_work = "obras" in status
        is_unpaved = "implantada" in status
        if casing:
            color = "#f8e6b5" if not (is_planned or is_work or is_unpaved) else "#f4ecd8"
            width = 3.25 if federal else 2.55
            dash = []
        else:
            color = "#cf9f4d" if federal else "#c9ad72"
            width = 2.25 if federal else 1.65
            dash = [8, 5] if is_planned or is_work else ([3, 3] if is_unpaved else [])
        if "duplicada" in status:
            width += 0.35
        pdf.setStrokeColor(HexColor(color))
        pdf.setLineWidth(width)
        pdf.setLineCap(1)
        pdf.setLineJoin(1)
        pdf.setDash(dash)
        path = pdf.beginPath()
        for points in polylines:
            if len(points) < 2:
                continue
            path.moveTo(*points[0])
            for point in points[1:]:
                path.lineTo(*point)
        pdf.drawPath(path, stroke=1, fill=0)
    pdf.setDash()


def boxes_overlap(first: tuple[float, float, float, float], second: tuple[float, float, float, float]) -> bool:
    return not (
        first[2] < second[0]
        or first[0] > second[2]
        or first[3] < second[1]
        or first[1] > second[3]
    )


def add_official_roads(source: Path, destination: Path, roads_path: Path) -> tuple[int, int]:
    if not roads_path.exists():
        raise FileNotFoundError(
            f"Official DAER road data is missing: {roads_path}. "
            "Run tools/update_official_roads.py first."
        )

    data = json.loads(roads_path.read_text(encoding="utf-8"))
    groups: dict[tuple[str, str], list[list[tuple[float, float]]]] = {}
    label_paths: dict[str, list[list[tuple[float, float]]]] = {}
    feature_count = 0
    for feature in data.get("features", []):
        geometry = feature.get("geometry") or {}
        if geometry.get("type") != "LineString":
            continue
        properties = feature.get("properties") or {}
        label = route_label(str(properties.get("CODIGO_SRE") or ""))
        if not label:
            continue
        coordinates = geometry.get("coordinates") or []
        points = [projected_to_pdf(float(x), float(y)) for x, y, *_ in coordinates]
        if len(points) < 2:
            continue
        network = "federal" if label.startswith("BR-") else "state"
        status = normalize_label(properties.get("SITUACAO_F") or "")
        groups.setdefault((network, status), []).append(points)
        label_paths.setdefault(label, []).append(points)
        feature_count += 1

    overlay_buffer = io.BytesIO()
    overlay = canvas.Canvas(overlay_buffer, pagesize=(6000, 6000), pageCompression=1)
    draw_grouped_paths(overlay, groups, casing=True)
    draw_grouped_paths(overlay, groups, casing=False)

    occupied: list[tuple[float, float, float, float]] = []
    label_count = 0
    for label, paths in sorted(label_paths.items()):
        ranked = sorted(paths, key=polyline_length, reverse=True)
        total_length = sum(polyline_length(path) for path in ranked)
        wanted = max(1, min(4, math.ceil(total_length / 780)))
        placed_for_route = 0
        for points in ranked:
            if placed_for_route >= wanted:
                break
            width = stringWidth(label, "Helvetica-Bold", 8.2)
            for fraction in (0.50, 0.32, 0.68, 0.20, 0.80):
                x, y = point_along(points, fraction)
                box = (x - width / 2 - 4, y - 5.5, x + width / 2 + 4, y + 5.5)
                if any(boxes_overlap(box, previous) for previous in occupied):
                    continue
                overlay.setFillColor(HexColor("#eef2ec"))
                overlay.roundRect(
                    x - width / 2 - 2.6,
                    y - 4.8,
                    width + 5.2,
                    10.6,
                    1.8,
                    stroke=0,
                    fill=1,
                )
                overlay.setFillColor(HexColor("#8c6729"))
                overlay.setFont("Helvetica-Bold", 8.2)
                overlay.drawString(x - width / 2, y - 2.7, label)
                occupied.append(box)
                label_count += 1
                placed_for_route += 1
                break

    source_text = overlay.beginText(180, 78)
    source_text.setTextRenderMode(0)
    source_text.setFont("Helvetica", 13)
    source_text.setFillColor(HexColor("#64766d"))
    source_text.textLine(
        "Limites: IBGE 2024  |  Rodovias BR e ERS: DAER/RS, Sistema Viário (abril de 2026)  |  Hidrografia: OpenStreetMap/Geofabrik"
    )
    source_text.setLeading(20)
    source_text.setFont("Helvetica", 11)
    source_text.textLine(
        "SIRGAS 2000 / Brazil Polyconic (EPSG:5880)  |  Trechos planejados, implantados ou em obras são diferenciados por tracejado."
    )
    overlay.drawText(source_text)
    overlay.save()
    overlay_buffer.seek(0)

    reader = PdfReader(source)
    page = reader.pages[0]
    official_overlay = PdfReader(overlay_buffer).pages[0]
    page.merge_page(official_overlay)
    writer = PdfWriter()
    writer.add_page(page)
    writer.add_metadata(
        {
            "/Title": "Rio Grande do Sul - malha rodoviária oficial BR e ERS",
            "/Author": "IBGE / DAER-RS / colaboradores do OpenStreetMap",
            "/Subject": "Sistema Viário oficial do DAER-RS, abril de 2026",
        }
    )
    with destination.open("wb") as output:
        writer.write(output)
    return feature_count, label_count


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


def save_webp_tile(image: Image.Image, destination: Path) -> None:
    image.save(destination, "WEBP", quality=96, method=6, exact=True)


def tile_level_directory(level: int) -> str:
    """Version the largest atlas so a browser cannot lock a stale delivery folder."""
    if level == max(HIGH_DENSITY_LEVELS):
        return f"{level}-r{MODERN_ASSET_REVISION}"
    return str(level)


def generate_vector_tiles(source_pdf: Path, assets_dir: Path) -> None:
    """Render high-density tiles from the PDF vectors, never from an 8K upscale."""
    tile_root = assets_dir / "map-tiles" / "modern"
    document = pdfium.PdfDocument(source_pdf)
    page = document[0]
    page_width, page_height = page.get_size()
    if abs(page_width - page_height) > 0.01:
        raise ValueError(f"Expected a square modern map, got {page_width}x{page_height}")

    for level in HIGH_DENSITY_LEVELS:
        scale = level / page_width
        count = math.ceil(level / TILE_SIZE)
        level_dir = tile_root / tile_level_directory(level)
        level_dir.mkdir(parents=True, exist_ok=True)
        for first_row in range(0, count, VECTOR_RENDER_BLOCK_TILES):
            pixel_top = first_row * TILE_SIZE
            pixel_bottom = min((first_row + VECTOR_RENDER_BLOCK_TILES) * TILE_SIZE, level)
            for first_col in range(0, count, VECTOR_RENDER_BLOCK_TILES):
                pixel_left = first_col * TILE_SIZE
                pixel_right = min((first_col + VECTOR_RENDER_BLOCK_TILES) * TILE_SIZE, level)
                crop = (
                    pixel_left / scale,
                    (level - pixel_bottom) / scale,
                    (level - pixel_right) / scale,
                    pixel_top / scale,
                )
                block = page.render(scale=scale, crop=crop, optimize_mode="lcd").to_pil().convert("RGB")
                expected_size = (pixel_right - pixel_left, pixel_bottom - pixel_top)
                if block.size != expected_size:
                    block = block.resize(expected_size, Image.Resampling.LANCZOS)

                last_row = min(first_row + VECTOR_RENDER_BLOCK_TILES, count)
                last_col = min(first_col + VECTOR_RENDER_BLOCK_TILES, count)
                for row in range(first_row, last_row):
                    for col in range(first_col, last_col):
                        x = (col - first_col) * TILE_SIZE
                        y = (row - first_row) * TILE_SIZE
                        width = min(TILE_SIZE, level - col * TILE_SIZE)
                        height = min(TILE_SIZE, level - row * TILE_SIZE)
                        save_webp_tile(
                            block.crop((x, y, x + width, y + height)),
                            level_dir / f"{col}-{row}.webp",
                        )
            completed = min(pixel_bottom, level)
            print(f"Rendered vector tiles {level}: {completed}/{level}px", flush=True)

    page.close()
    document.close()


def generate_delivery_assets(
    image_path: Path,
    vector_pdf: Path,
    assets_dir: Path,
    manifest_path: Path,
) -> None:
    image = Image.open(image_path).convert("RGB")
    tile_root = assets_dir / "map-tiles" / "modern"
    for level in (1024, 2048, 4096, 8000):
        level_image = image if level == 8000 else image.resize((level, level), Image.Resampling.LANCZOS)
        level_dir = tile_root / str(level)
        level_dir.mkdir(parents=True, exist_ok=True)
        count = math.ceil(level / TILE_SIZE)
        for row in range(count):
            for col in range(count):
                box = (
                    col * TILE_SIZE,
                    row * TILE_SIZE,
                    min((col + 1) * TILE_SIZE, level),
                    min((row + 1) * TILE_SIZE, level),
                )
                save_webp_tile(level_image.crop(box), level_dir / f"{col}-{row}.webp")

    generate_vector_tiles(vector_pdf, assets_dir)

    preview = image.resize((2400, 2400), Image.Resampling.LANCZOS)
    preview.save(assets_dir / "map-modern-preview.webp", "WEBP", quality=94, method=6, exact=True)
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
    preview_url = manifest["modern"]["preview"].split("?", 1)[0]
    manifest["modern"]["preview"] = f"{preview_url}?revision={MODERN_ASSET_REVISION}"
    for level in manifest["modern"]["levels"]:
        level["revision"] = MODERN_ASSET_REVISION
        level["url"] = (
            f"public/assets/map-tiles/modern/{tile_level_directory(int(level['width']))}/"
        )
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
        official_pdf = Path(temp_dir) / "mapa-oficial-daer.pdf"
        cities, lajeados, uruguai_labels, route_labels, road_paths = build_clean_pdf(args.source, clean_pdf)
        official_features, official_labels = add_official_roads(clean_pdf, official_pdf, OFFICIAL_ROADS)
        width, height = render_site_asset(official_pdf, args.destination)
        if args.assets_dir and args.manifest:
            generate_delivery_assets(args.destination, official_pdf, args.assets_dir, args.manifest)

    print(f"Removed {cities} municipal-label and {lajeados} lajeado text operations")
    print(f"Removed {uruguai_labels} Rio Uruguai text operations at Porto Maua")
    print(f"Replaced {road_paths} legacy road paths and {route_labels} route-label operations")
    print(f"Added {official_features} official DAER features and {official_labels} route labels")
    print(f"Rendered {width}x{height}: {args.destination}")


if __name__ == "__main__":
    main()
