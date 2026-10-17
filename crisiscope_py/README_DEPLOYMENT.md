\# CrisiscopeX — Python Backend Deployment



\## Overview



CrisiscopeX is a Python-based disaster analysis prototype that provides disaster summaries, rule-based risk indicators, and hypothetical disaster simulations.



The included CSV dataset contains illustrative sample records, not verified live disaster alerts.



\## Requirements



\- Python compatible with the target IBM LinuxONE operating system and architecture

\- pandas (version compatibility must be verified on the target server)



\## Project Structure



\- `backend/` — Python backend modules

\- `data/` — Sample disaster dataset

\- `tests/` — Unit tests

\- `requirements.txt` — Python dependencies



\## Setup



Create and activate a virtual environment on the LinuxONE server, then install the dependencies:



```bash

python3 -m venv .venv

source .venv/bin/activate

python -m pip install --upgrade pip

python -m pip install -r requirements.txt

```



\## Run the Backend



From the project root:



```bash

python -m backend.main

```



\## Run Tests



```bash

python -m unittest discover -s tests -v

```



\## Deployment Notes



\- Do not copy the Windows `.venv` directory to LinuxONE.

\- Install dependencies on the target server.

\- Keep the `backend/`, `data/`, `tests/`, and `requirements.txt` files together.

\- Verify Python and pandas compatibility on the selected LinuxONE image before deployment.

\- Risk scores and sample data are illustrative and are not official emergency predictions.



