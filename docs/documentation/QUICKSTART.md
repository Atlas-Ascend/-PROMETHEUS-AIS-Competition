# PROMETHEUS Competition Quickstart

## Always-available website

The `docs/` directory is the complete static competition website. GitHub Actions publishes it to GitHub Pages after every push to `main`.

Expected public URL:

`https://atlas-ascend.github.io/-PROMETHEUS-AIS-Competition/`

## Run the executable proof locally

```bash
python -m pip install -e .
python -m unittest discover -s tests -v
python -m prometheus.cli doctor --json
python -m prometheus.cli demo reset
python -m prometheus.cli demo competition
python -m prometheus.cli receipt verify artifacts/competition-demo/FINAL_RECEIPT.json
python -m prometheus.cli interface competition
```

The interface command serves the same visual system included in the public website.

## Static evidence

- `proofgrid/FINAL_RECEIPT.json`
- `proofgrid/HYDRA_REPAIR_RECEIPT.json`
- `genomes/CAPABILITY_GENOME.json`
- `genomes/CAPABILITY_GENOME_REUSE.json`
- `data/demo.json`

The hosted evidence is a deterministic public snapshot. The executable repository regenerates fresh local receipts.
