from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path


def canonical(obj):
    return json.dumps(obj, sort_keys=True, separators=(",", ":")).encode()


def verify(path: Path) -> bool:
    receipt = json.loads(path.read_text())
    run_dir = path.parent
    claimed = receipt.pop('proof_hash')
    actual = hashlib.sha256(canonical(receipt)).hexdigest()
    evidence_ok = all(
        (run_dir / name).exists()
        and hashlib.sha256((run_dir / name).read_bytes()).hexdigest() == digest
        for name, digest in receipt['evidence'].items()
    )
    ok = claimed == actual and evidence_ok and receipt['result']['status'] == 'PASSED'
    print(json.dumps({
        'verified': ok,
        'receipt_hash_valid': claimed == actual,
        'evidence_valid': evidence_ok,
        'status': receipt['result']['status'],
    }, indent=2))
    return ok


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('receipt', type=Path)
    args = parser.parse_args()
    raise SystemExit(0 if verify(args.receipt) else 1)
