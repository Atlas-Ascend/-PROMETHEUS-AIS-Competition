import json
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from prometheus.cli import Ledger, ReplayDetected, run_demo, verify_receipt


class ReplayGuardTests(unittest.TestCase):
    def test_duplicate_without_guard_fails_closed(self):
        ledger = Ledger()
        payload = {"artifact": "alpha"}
        ledger.execute("op-1", payload, idempotent=False)
        with self.assertRaises(ReplayDetected):
            ledger.execute("op-1", payload, idempotent=False)

    def test_duplicate_with_guard_is_safe(self):
        ledger = Ledger()
        payload = {"artifact": "alpha"}
        ledger.execute("op-1", payload, idempotent=True)
        self.assertEqual(ledger.execute("op-1", payload, idempotent=True), "replay_safely_ignored")

    def test_conflicting_payload_is_rejected(self):
        ledger = Ledger()
        ledger.execute("op-1", {"artifact": "alpha"}, idempotent=True)
        with self.assertRaises(ReplayDetected):
            ledger.execute("op-1", {"artifact": "beta"}, idempotent=True)


class CommandToProofTests(unittest.TestCase):
    def test_full_demo_and_receipt(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp) / "evidence"
            result = run_demo(root)
            self.assertEqual(result["status"], "verified")
            self.assertTrue(result["genome_reused"])
            self.assertEqual(result["tests_failed"], 0)
            self.assertTrue(verify_receipt(root / "FINAL_RECEIPT.json")["verified"])

    def test_tampering_fails_verification(self):
        with TemporaryDirectory() as tmp:
            root = Path(tmp) / "evidence"
            run_demo(root)
            (root / "MISSION.json").write_text(json.dumps({"tampered": True}), encoding="utf-8")
            self.assertFalse(verify_receipt(root / "FINAL_RECEIPT.json")["verified"])


if __name__ == "__main__":
    unittest.main()
