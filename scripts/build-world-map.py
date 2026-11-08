"""Builds public/routes-engine/world-50m.json for the route explorer map.

Source: Natural Earth 1:50m admin-0 countries (public domain)
  https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson
Projection matches the concept engine: x = (lon + 180) * 1000 / 360, y = (85 - lat) * 500 / 145.

Usage: python3 scripts/build-world-map.py <ne_50m_admin_0_countries.geojson>
"""
import json
import sys

ALIASES = {"KOS": "XKX", "SDS": "SSD", "PSX": "PSE", "SAH": "ESH"}  # NE ADM0_A3 -> ids used by the engine
SKIP = {"ATA"}


def project(lon, lat):
    return (lon + 180) * 1000 / 360, (85 - lat) * 500 / 145


def ring_path(ring):
    out, last = [], None
    for lon, lat in ring:
        x, y = project(lon, lat)
        pt = (round(x, 1), round(y, 1))
        if pt != last:
            out.append(pt)
            last = pt
    if len(out) < 3:
        return ""
    return "M" + "L".join(f"{x:g},{y:g}" for x, y in out) + "Z"


def main(src):
    data = json.load(open(src))
    countries = []
    for f in data["features"]:
        p = f["properties"]
        cid = ALIASES.get(p["ADM0_A3"], p["ADM0_A3"])
        if cid in SKIP:
            continue
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        d = "".join(ring_path(poly[0]) for poly in polys)  # outer rings only
        if d:
            countries.append({"id": cid, "name": p["NAME"], "d": d})
    json.dump(countries, open("public/routes-engine/world-50m.json", "w"), separators=(",", ":"))
    print(len(countries), "countries")


if __name__ == "__main__":
    main(sys.argv[1])
