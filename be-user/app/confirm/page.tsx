"use client";

import { useState } from "react";
import { ethers } from "ethers";

const ABI = [
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

export default function ResalePage() {
  const [ticketId, setTicketId] = useState("");
  const [log, setLog] = useState("");
  const [transferData, setTransferData] = useState<any>(null);

  const appendLog = (msg: string) => {
    setLog((prev) => prev + "\n" + msg);
  };

  // 🔌 connect wallet
  const getSigner = async () => {
    const provider = new ethers.BrowserProvider(
      (window as any).ethereum
    );
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
  };

  // =============================
  // 🟢 STEP 0: BUYER CREATE TRANSFER
  // =============================
  const handleCreateTransfer = async () => {
    try {
      appendLog("🟢 Creating transfer...");

      const res = await fetch("/api/resale/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ticket_id: ticketId }),
      });

      const data = await res.json();

      if (!res.ok) {
        appendLog("❌ BUY ERROR: " + data.message);
        return;
      }

      setTransferData(data);

      appendLog("✅ Transfer created: " + data.transfer_id);
      appendLog("📦 Token: " + data.token_id);
      appendLog("👤 Seller: " + data.from_wallet);
      appendLog("👤 Buyer: " + data.to_wallet);

    } catch (err: any) {
      appendLog("❌ ERROR: " + err.message);
    }
  };

  // =============================
  // 🔵 STEP 1: SELLER APPROVE
  // =============================
  const handleApprove = async () => {
    try {
      if (!transferData) {
        appendLog("❌ Chưa tạo transfer");
        return;
      }

      appendLog("🔌 Seller connecting...");

      const signer = await getSigner();
      const seller = await signer.getAddress();

      appendLog("👤 Current wallet: " + seller);

      const { token_id, contract_address, to_wallet } = transferData;

      const contract = new ethers.Contract(
        contract_address,
        ABI,
        signer
      );

      const owner = await contract.ownerOf(token_id);

      appendLog("🔍 Owner on chain: " + owner);

      if (owner.toLowerCase() !== seller.toLowerCase()) {
        appendLog("❌ Sai ví → hãy switch sang SELLER");
        return;
      }

      appendLog("✍️ Approving buyer...");

      const tx = await contract.approve(to_wallet, token_id);

      appendLog("⏳ Waiting approve...");
      await tx.wait();

      appendLog("✅ APPROVE DONE");

    } catch (err: any) {
      appendLog("❌ ERROR: " + err.message);
    }
  };

  // =============================
  // 🔴 STEP 2: BUYER TRANSFER
  // =============================
  const handleTransfer = async () => {
    try {
      if (!transferData) {
        appendLog("❌ Chưa có transfer");
        return;
      }

      appendLog("🔌 Buyer connecting...");

      const signer = await getSigner();
      const buyer = await signer.getAddress();

      appendLog("👤 Current wallet: " + buyer);

      const {
        transfer_id,
        from_wallet,
        to_wallet,
        token_id,
        contract_address,
      } = transferData;

      if (buyer.toLowerCase() !== to_wallet.toLowerCase()) {
        appendLog("❌ Sai ví → hãy switch sang BUYER");
        return;
      }

      const contract = new ethers.Contract(
        contract_address,
        ABI,
        signer
      );

      appendLog("🚀 Transferring...");

      const tx = await contract.transferFrom(
        from_wallet,
        to_wallet,
        token_id
      );

      appendLog("⏳ Waiting transfer...");
      await tx.wait();

      appendLog("✅ TRANSFER SUCCESS");
      appendLog("🔗 TX: " + tx.hash);

      // confirm BE
      appendLog("📡 Confirming BE...");

      const res = await fetch("/api/resale/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transfer_id,
          tx_hash: tx.hash,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        appendLog("❌ CONFIRM ERROR: " + result.message);
        return;
      }

      appendLog("✅ CONFIRMED DB");

    } catch (err: any) {
      appendLog("❌ ERROR: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔥 Resale Flow (Correct Version)</h2>

      <input
        placeholder="ticket_id"
        value={ticketId}
        onChange={(e) => setTicketId(e.target.value)}
      />

      <br /><br />

      <button onClick={handleCreateTransfer}>
        👉 Step 1: Buyer Create Transfer
      </button>

      <br /><br />

      <button onClick={handleApprove}>
        👉 Step 2: Seller Approve
      </button>

      <br /><br />

      <button onClick={handleTransfer}>
        👉 Step 3: Buyer Transfer + Confirm
      </button>

      <pre style={{ marginTop: 20 }}>{log}</pre>
    </div>
  );
}