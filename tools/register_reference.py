"""Estimate the CSS scale and crop offset of a marked-up map screenshot."""

from __future__ import annotations

import argparse

import numpy as np
from PIL import Image


def edge_image(image: Image.Image) -> np.ndarray:
    gray = np.asarray(image.convert("L"), dtype=np.float32)
    horizontal = np.zeros_like(gray)
    vertical = np.zeros_like(gray)
    horizontal[:, 1:] = np.abs(gray[:, 1:] - gray[:, :-1])
    vertical[1:, :] = np.abs(gray[1:, :] - gray[:-1, :])
    edges = horizontal + vertical
    return np.clip(edges, 0, 80)


def normalized_match(image: np.ndarray, template: np.ndarray) -> tuple[float, int, int]:
    height, width = template.shape
    template = template - template.mean()
    template_energy = np.square(template).sum()
    fft_shape = (image.shape[0] + height - 1, image.shape[1] + width - 1)
    correlation = np.fft.irfft2(
        np.fft.rfft2(image, fft_shape) * np.fft.rfft2(template[::-1, ::-1], fft_shape),
        fft_shape,
    ).real
    correlation = correlation[height - 1 : image.shape[0], width - 1 : image.shape[1]]

    integral = np.pad(image.cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    squared = np.pad(np.square(image).cumsum(0).cumsum(1), ((1, 0), (1, 0)))
    sums = integral[height:, width:] - integral[:-height, width:] - integral[height:, :-width] + integral[:-height, :-width]
    sums_sq = squared[height:, width:] - squared[:-height, width:] - squared[height:, :-width] + squared[:-height, :-width]
    variance = np.maximum(sums_sq - np.square(sums) / (height * width), 1e-6)
    score = correlation / np.sqrt(variance * template_energy)
    y, x = np.unravel_index(np.nanargmax(score), score.shape)
    return float(score[y, x]), int(x), int(y)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("map_image")
    parser.add_argument("screenshot")
    args = parser.parse_args()

    map_image = Image.open(args.map_image).convert("RGB")
    screenshot = Image.open(args.screenshot).convert("RGB")
    reference_box = (520, 180, 1000, 780)
    reference = screenshot.crop(reference_box)
    downsample = 4
    reference = reference.resize((reference.width // downsample, reference.height // downsample), Image.Resampling.LANCZOS)
    template = edge_image(reference)

    best = (-1.0, 0.0, 0, 0)
    for scale in np.arange(1.36, 1.441, 0.005):
        scaled = map_image.resize(
            (round(map_image.width * scale / downsample), round(map_image.height * scale / downsample)),
            Image.Resampling.LANCZOS,
        )
        score, x, y = normalized_match(edge_image(scaled), template)
        if score > best[0]:
            best = (score, float(scale), x, y)
        print(f"scale={scale:.3f} score={score:.4f} offset=({reference_box[0] - x * downsample:.1f}, {reference_box[1] - y * downsample:.1f})")

    score, scale, x, y = best
    offset_x = reference_box[0] - x * downsample
    offset_y = reference_box[1] - y * downsample
    print(f"BEST scale={scale:.3f} score={score:.4f} offset=({offset_x:.1f}, {offset_y:.1f})")


if __name__ == "__main__":
    main()
