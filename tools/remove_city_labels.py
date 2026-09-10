"""Remove municipality labels from the current-map PDF and render the site asset."""

from __future__ import annotations

import argparse
import tempfile
from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream


CITY_FONTS = {"/T1_0", "/T1_1", "/T1_2"}


def is_horizontal_map_label(matrix: list[object] | tuple[object, ...]) -> bool:
    """The map is rotated in the PDF, so horizontal labels use this 90-degree matrix."""
    if len(matrix) != 6:
        return False
    a, b, c, d, _, _ = (float(value) for value in matrix)
    return abs(a) < 0.03 and abs(d) < 0.03 and abs(b) > 3.8 and abs(c) > 3.8


def is_legend_text(matrix: list[object] | tuple[object, ...]) -> bool:
    """Keep explanatory text in the printed legend at the lower-left of the map."""
    if len(matrix) != 6:
        return False
    x, y = float(matrix[4]), float(matrix[5])
    return x >= 430 and 140 <= y <= 340


def is_large_ijui_label(font: str, matrix: list[object] | tuple[object, ...]) -> bool:
    """Remove only the prominent Rio Ijuí caption requested for the presentation."""
    if font != "/T1_4" or len(matrix) != 6:
        return False
    x, y = float(matrix[4]), float(matrix[5])
    return abs(x - 122.2993) < 0.2 and abs(y - 373.3418) < 0.2


def build_clean_pdf(source: Path, destination: Path) -> int:
    reader = PdfReader(source)
    page = reader.pages[0]
    content = ContentStream(page.get_contents(), reader)

    current_font = ""
    current_matrix: list[object] = []
    removed = 0
    cleaned_operations = []

    for operands, operator in content.operations:
        if operator == b"Tf":
            current_font = str(operands[0])
        elif operator == b"Tm":
            current_matrix = list(operands)

        is_text_draw = operator in {b"Tj", b"TJ", b"'", b'"'}
        remove_city = (
            is_text_draw
            and current_font in CITY_FONTS
            and is_horizontal_map_label(current_matrix)
            and not is_legend_text(current_matrix)
        )
        remove_ijui = is_text_draw and is_large_ijui_label(current_font, current_matrix)
        if remove_city or remove_ijui:
            removed += 1
            continue

        cleaned_operations.append((operands, operator))

    content.operations = cleaned_operations
    page.replace_contents(content)

    writer = PdfWriter()
    writer.add_page(page)
    with destination.open("wb") as output:
        writer.write(output)

    return removed


def render_site_asset(source_pdf: Path, destination_png: Path) -> tuple[int, int]:
    document = pdfium.PdfDocument(source_pdf)
    page = document[0]
    bitmap = page.render(scale=400 / 72)
    rendered = bitmap.to_pil().convert("RGB")

    # Same map-only crop used by the site, followed by a clockwise rotation.
    cropped = rendered.crop((0, 592, 3308, 4047))
    landscape = cropped.transpose(Image.Transpose.ROTATE_270)
    destination_png.parent.mkdir(parents=True, exist_ok=True)
    landscape.save(destination_png, format="PNG", optimize=True)

    page.close()
    document.close()
    return landscape.size


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    args = parser.parse_args()

    with tempfile.TemporaryDirectory(prefix="expedicao-map-") as temp_dir:
        clean_pdf = Path(temp_dir) / "mapa-sem-cidades.pdf"
        removed = build_clean_pdf(args.source, clean_pdf)
        width, height = render_site_asset(clean_pdf, args.destination)

    print(f"Removed {removed} text-show operations")
    print(f"Rendered {width}x{height}: {args.destination}")


if __name__ == "__main__":
    main()
