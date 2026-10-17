"""Normalize OpenCity/IMD city-level monthly rainfall (never expand to daily/hourly)."""
from __future__ import annotations
import json
from pathlib import Path
import pandas as pd
from src.validation.checks import normalize_rainfall, quality_report, save_report, stable_id

MONTHS={"Jan":1,"Feb":2,"Mar":3,"Apr":4,"May":5,"June":6,"July":7,"Aug":8,"Sept":9,"Oct":10,"Nov":11,"Dec":12}

def clean_imd_monthly(source: Path, output_csv: Path, *, years: set[int] | None=None, months: set[int] | None=None) -> tuple[pd.DataFrame,pd.DataFrame,dict]:
    frame=pd.read_csv(source,encoding="utf-8-sig")
    required={"Year",*MONTHS}
    if not required.issubset(frame.columns): raise ValueError(f"IMD monthly file missing fields: {sorted(required-set(frame.columns))}")
    accepted=[]; rejected=[]; rows_checked=0
    for row_index,row in frame.iterrows():
        try: year=int(str(row["Year"]).strip())
        except (ValueError,TypeError): continue # LPA/normal rows are not dated observations
        if years is not None and year not in years: continue
        for month_name,month in MONTHS.items():
            if months is not None and month not in months: continue
            rows_checked+=1
            raw=row[month_name]
            if pd.isna(raw):
                rejected.append({"row":int(row_index),"year":year,"month":month,"reason":"missing_monthly_value"});continue
            try: value=normalize_rainfall(raw,"mm")
            except (ValueError,TypeError) as exc:
                rejected.append({"row":int(row_index),"year":year,"month":month,"reason":str(exc)});continue
            accepted.append({"observation_key":stable_id("rain", "blr_imd_monthly", year, month),
              "observed_at_utc":f"{year:04d}-{month:02d}-01T00:00:00+00:00","location_name":"Bengaluru city-level aggregate",
              "latitude":None,"longitude":None,"rainfall_mm":value,"source_type":"historical","quality_status":"accepted",
              "raw_attributes":{"source_year":year,"source_month":month_name,"original_value":float(raw),"original_unit":"mm",
                "temporal_resolution":"monthly","source_row":int(row_index)}})
    out=pd.DataFrame(accepted)
    output_csv.parent.mkdir(parents=True,exist_ok=True);out.to_csv(output_csv,index=False)
    report=quality_report(source.name,"India Meteorological Department via OpenCity",rows_checked,len(accepted),len(rejected),
      [{"severity":"warning","reason":r["reason"],"year":r["year"],"month":r["month"]} for r in rejected])
    report.update(temporal_resolution="monthly",units="mm",coverage_years=[int(y) for y in frame.Year.astype(str) if y.isdigit()],selected_years=sorted(years) if years else None,selected_months=sorted(months) if months else None,rejected_records=rejected,output_path=str(output_csv))
    save_report(report,output_csv.parent.parent/"outputs"/f"{output_csv.stem}_quality.json")
    return out,pd.DataFrame(rejected),report
