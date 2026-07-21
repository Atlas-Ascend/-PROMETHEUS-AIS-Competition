from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from prometheus.cli import Ledger, ReplayDetected, run_demo, verify_receipt


class LedgerBehaviorTests(unittest.TestCase):
    def test_first_consequential_operation_executes(self) -> None:
        ledger = Ledger()
        result = ledger.execute("operation-001", {"artifact": "alpha"}, idempotent=False)
        self.assertEqual(result, "executed")

    def test_unsafe_duplicate_operation_fails_closed(self) -> None:
        ledger = Ledger()
        payload = {"artifact": "alpha"}
        ledger.execute("operation-001", payload, idempotent=False)

        with self.assertRaises(ReplayDetected):
            ledger.execute("operation-001", payload, idempotent=False)

    def test_idempotent_duplicate_is_safely_ignored(self) -> None:
        ledger = Ledger()
        payload = {"artifact": "alpha"}
        ledger.execute("operation-001", payload, idempotent=False)

        result = ledger.execute("operation-001", payload, idempotent=True)
        self.assertEqual(result, "replay_safely_ignored")

    def test_conflicting_payload_is_rejected_even_when_idempotent(self) -> None:
        ledger = Ledger()
        ledger.execute("operation-001", {"artifact": "alpha"}, idempotent=False)

        with self.assertRaises(ReplayDetected):
            ledger.execute("operation-001", {"artifact": "beta"}, idempotent=True)


class CommandToProofTests(unittest.TestCase):
    def test_competition_demo_closes_the_verified_proof_chain(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory) / "competition-demo"
            result = run_demo(root)
            receipt_path = root / "FINAL_RECEIPT.json"
            receipt = json.loads(receipt_path.read_text(encoding="utf-8"))
            verification = verify_receipt(receipt_path)

            self.assertEqual(result["status"], "verified")
            self.assertEqual(result["tests_passed"], 5)
            self.assertEqual(result["tests_failed"], 0)
            self.assertTrue(result["genome_reused"])
            self.assertEqual(receipt["promotion"], "authorized")
            self.assertEqual(receipt["tests"], {"passed": 5, "failed": 0})
            self.assertEqual(len(receipt["artifacts"]), 8)
            self.assertTrue(verification["verified"])
            self.assertTrue(all(verification["artifacts"].values()))


if __name__ == "__main__":
    unittest.main()
