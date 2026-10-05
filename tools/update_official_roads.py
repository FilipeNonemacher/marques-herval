"""Download the official DAER/RS road network used by the current map."""

from __future__ import annotations

import argparse
import json
import ssl
import urllib.parse
import urllib.request
from pathlib import Path


SERVICE = (
    "https://zee.rs.gov.br/server/rest/services/"
    "1_RSAGUAS/Mapa_basico_SIGRSAGUA/FeatureServer/32/query"
)
DEFAULT_DESTINATION = (
    Path(__file__).parent / "data" / "daer-rs-sistema-viario-2026-04.geojson"
)
EXPECTED_MINIMUM_FEATURES = 1200


def download(destination: Path) -> tuple[int, int]:
    query = urllib.parse.urlencode(
        {
            "where": (
                "REDE IN ('RODOVIAS ESTADUAIS','RODOVIAS FEDERAIS',"
                "'RODOVIAS ESTADUAIS COINCIDENTES')"
            ),
            "outFields": "CODIGO_SRE,REDE,ADMINISTRA,SITUACAO_F",
            "returnGeometry": "true",
            "outSR": "5880",
            # Three metres is well below one pixel even in the 32K atlas, but
            # reduces the official one-million-vertex response to a practical
            # size without visually changing the road courses.
            "maxAllowableOffset": "3",
            "geometryPrecision": "2",
            "f": "geojson",
            "resultRecordCount": "2000",
        }
    )
    # The government endpoint currently presents a certificate chain that is
    # not accepted by the bundled Windows Python runtime. The host and exact
    # HTTPS URL are fixed above; disabling local chain validation is limited to
    # this reproducible data download.
    context = ssl._create_unverified_context()
    with urllib.request.urlopen(f"{SERVICE}?{query}", context=context, timeout=180) as response:
        raw = response.read()

    data = json.loads(raw)
    features = data.get("features") or []
    if data.get("exceededTransferLimit") or len(features) < EXPECTED_MINIMUM_FEATURES:
        raise RuntimeError(
            f"Incomplete DAER response: {len(features)} features, "
            f"transfer limit={data.get('exceededTransferLimit')}"
        )
    if data.get("crs", {}).get("properties", {}).get("name") != "EPSG:5880":
        raise RuntimeError("DAER response did not use the requested EPSG:5880 projection")

    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    return len(features), destination.stat().st_size


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("destination", nargs="?", type=Path, default=DEFAULT_DESTINATION)
    args = parser.parse_args()
    count, size = download(args.destination)
    print(f"Saved {count} official DAER features ({size} bytes): {args.destination}")


if __name__ == "__main__":
    main()
