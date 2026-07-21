# Quickstart

```bash
python -m pip install -e .
python -m unittest discover -s tests -v
python -m prometheus.cli demo reset
python -m prometheus.cli demo competition
python -m prometheus.cli receipt verify artifacts/competition-demo/FINAL_RECEIPT.json
python -m prometheus.cli contest claims-verify
python -m prometheus.cli contest evidence-verify
python -m prometheus.cli contest submission-check
python -m prometheus.cli interface competition
```

Interface: `http://127.0.0.1:8787/competition/interface/`

Screenshot mode: `http://127.0.0.1:8787/competition/interface/?screenshot=1`
