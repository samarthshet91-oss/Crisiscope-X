# Limitations and pending verification

Downloaded and loaded: OpenCity/KSRSAC flood hotspots (70 points), BBMP primary stormwater drains 2022 (163 MultiLineStrings), BBMP road-width map (23,238 MultiLineStrings), an IMD/OpenCity city-level monthly rainfall sample (May-June 2025, 2 records), and 59 daily IMD/NWIC observations for Bangalore Rural (2026-08-19 through 2026-10-16). The last file is a national extract with 42,917 records; only Bangalore Rural is present for Karnataka, and Bengaluru Urban is absent. Its NWIC metadata states “No License Provided.” Daily dates are treated as calendar dates in Asia/Kolkata and normalized to UTC midnight. All KML features passed geometry checks in EPSG:4326. The IMD monthly file spans 1901-2025, includes non-year LPA summary rows that were excluded, and has no station coordinates. KSNDMC catalogue rainfall is annual/seasonal, so it cannot supply a one-to-two-month time-series sample. The public OSM Overpass query failed (HTTP 502 then HTTP 500); no OSM file was saved. Use the [GPM Data Directory](https://gpm.nasa.gov/data/directory), select IMERG V07 Final Run at 30-minute resolution and July 2024, register for PPS/Earthdata access if prompted, download HDF5/NetCDF or GeoTIFF, then preserve the untouched file in `data/raw/` before processing. IMERG, GHSL, and Copernicus EMS were deferred. No PostGIS support is assumed. Static maps do not indicate current road status; all scenario values/events are synthetic.

## LinuxONE verification

The final local checks ran on Windows 11, CPython 3.14.4, AMD64; they are not a LinuxONE test. WSL is not installed. A cross-target pip binary-wheel resolution attempt for CPython 3.12 on `manylinux*_s390x` did not find a pandas wheel; this does not rule out building it from source. PyPI's current distribution listings for [pandas](https://pypi.org/project/pandas/) and [pyogrio](https://pypi.org/project/pyogrio/) do not list s390x wheels. The NumPy/GDAL/GEOS/Shapely and Psycopg native stack therefore needs target-specific installation/build verification on the actual LinuxONE distribution.

Run the target verification on IBM LinuxONE after provisioning the approved compiler and geospatial system libraries:

```sh
python3.12 -m venv .venv
. .venv/bin/activate
python -m pip install -r requirements.txt
python -m compileall -q src tests
python -m pytest -q
python -c "import geopandas, networkx, numpy, pandas, psycopg, shapely; print('LinuxONE imports passed')"
python -m src.database.connection
```

The database smoke test requires a configured `DATABASE_URL` and reachable PostgreSQL service. Record the OS release, Python version, `uname -m`, geospatial library versions, dependency-install output, test result, and database connectivity result before claiming LinuxONE support.
