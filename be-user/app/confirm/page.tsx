"use client";

import { useState } from "react";
import { ethers } from "ethers";

const ABI = [
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getApproved(uint256 tokenId) view returns (address)"
];

export default function ResalePage() {
  const [ticketId, setTicketId] = useState("");
  const [log, setLog] = useState("");
  const [data, setData] = useState<any>(null);

  const appendLog = (msg: string) => {
    setLog((prev) => prev + "\n" + msg);
  };

  const getSigner = async () => {
    const provider = new ethers.BrowserProvider((window as any).ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    appendLog("👤 Current wallet: " + address);

    return signer;
  };

  // =============================
  // 🟢 1. SELLER LIST
  // =============================
  const handleList = async () => {
    try {
      appendLog("🟢 SELLER listing ticket...");

      const signer = await getSigner();
      const seller = await signer.getAddress();
      appendLog("🧑‍💼 SELLER wallet: " + seller);

      const res = await fetch("/api/resale/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_id: ticketId }),
      });

      const result = await res.json();

      if (!res.ok) {
        appendLog("❌ LIST ERROR: " + result.message);
        return;
      }

      appendLog("✅ Listed successfully");

    } catch (err: any) {
      appendLog("❌ ERROR: " + err.message);
    }
  };

  // =============================
  // 🔵 2. BUYER BUY
  // =============================
  const handleBuy = async () => {
    try {
      appendLog("🟡 BUYER creating request...");

      const signer = await getSigner();
      const buyer = await signer.getAddress();
      appendLog("🧑‍💻 BUYER wallet (FE): " + buyer);

      const res = await fetch("/api/resale/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ticket_id: ticketId }),
      });

      const result = await res.json();

      if (!res.ok) {
        appendLog("❌ BUY ERROR: " + result.message);
        return;
      }

      setData(result);

      appendLog("✅ Transfer created");
      appendLog("📦 FROM (seller): " + result.from_wallet);
      appendLog("📦 TO (buyer): " + result.to_wallet);

      if (result.from_wallet.toLowerCase() === result.to_wallet.toLowerCase()) {
        appendLog("❌ BUG: buyer = seller (SAI)");
      }

    } catch (err: any) {
      appendLog("❌ ERROR: " + err.message);
    }
  };

  // =============================
  // 🟠 3. SELLER APPROVE
  // =============================
  const handleApprove = async () => {
    try {
      if (!data) return appendLog("❌ No data");

      appendLog("🔌 Seller approving...");

      const signer = await getSigner();
      const seller = await signer.getAddress();

      const { token_id, contract_address, from_wallet, to_wallet } = data;

      appendLog("📦 Expected SELLER: " + from_wallet);
      appendLog("📦 Expected BUYER: " + to_wallet);

      if (seller.toLowerCase() !== from_wallet.toLowerCase()) {
        appendLog("❌ Sai ví SELLER");
        return;
      }

      const contract = new ethers.Contract(contract_address, ABI, signer);

      const owner = await contract.ownerOf(token_id);
      appendLog("👑 Owner on-chain: " + owner);

      if (owner.toLowerCase() !== seller.toLowerCase()) {
        appendLog("❌ Bạn không sở hữu NFT");
        return;
      }

      const tx = await contract.approve(to_wallet, token_id);
      await tx.wait();

      const approved = await contract.getApproved(token_id);
      appendLog("✅ APPROVED FOR: " + approved);

    } catch (err: any) {
      appendLog("❌ ERROR: " + err.message);
    }
  };

  // =============================
  // 🔴 4. BUYER TRANSFER
  // =============================
  const handleTransfer = async () => {
    try {
      if (!data) return appendLog("❌ No data");

      appendLog("🔌 Buyer transferring...");

      const signer = await getSigner();
      const buyer = await signer.getAddress();

      const {
        transfer_id,
        from_wallet,
        to_wallet,
        token_id,
        contract_address,
      } = data;

      appendLog("📦 FROM (seller): " + from_wallet);
      appendLog("📦 TO (buyer): " + to_wallet);

      if (buyer.toLowerCase() !== to_wallet.toLowerCase()) {
        appendLog("❌ Sai ví BUYER");
        return;
      }

      if (from_wallet.toLowerCase() === to_wallet.toLowerCase()) {
        appendLog("❌ BUG: self-transfer");
        return;
      }

      const contract = new ethers.Contract(contract_address, ABI, signer);

      const owner = await contract.ownerOf(token_id);
      appendLog("👑 Owner before: " + owner);

      if (owner.toLowerCase() !== from_wallet.toLowerCase()) {
        appendLog("❌ Owner không khớp seller");
        return;
      }

      appendLog("🚀 TRANSFER EXECUTING...");
      appendLog(`➡️ ${from_wallet} → ${to_wallet}`);

      const tx = await contract.transferFrom(
        from_wallet,
        to_wallet,
        token_id
      );

      await tx.wait();

      appendLog("✅ TRANSFER DONE");
      appendLog("TX: " + tx.hash);

      // =============================
      // CONFIRM
      // =============================
      appendLog("📡 Confirming BE...");

      const res = await fetch("/api/resale/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      const newOwner = await contract.ownerOf(token_id);
      appendLog("👑 NEW OWNER: " + newOwner);

      appendLog("🎉 SUCCESS");

    } catch (err: any) {
      appendLog("❌ ERROR: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔥 Resale Flow (DEBUG VERSION)</h2>

      <input
        placeholder="ticket_id"
        value={ticketId}
        onChange={(e) => setTicketId(e.target.value)}
      />

      <br /><br />

      <button onClick={handleList}>1️⃣ Seller: List</button>
      <br /><br />

      <button onClick={handleBuy}>2️⃣ Buyer: Buy</button>
      <br /><br />

      <button onClick={handleApprove}>3️⃣ Seller: Approve</button>
      <br /><br />

      <button onClick={handleTransfer}>4️⃣ Buyer: Transfer</button>

      <pre style={{ marginTop: 20 }}>{log}</pre>
    </div>
  );
}