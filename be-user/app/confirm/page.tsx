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

  console.log("👤 ACTIVE WALLET =", address);

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

      appendLog("🧑‍💻 BUYER wallet: " + buyer);

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
      appendLog("📦 FROM: " + result.from_wallet);
      appendLog("📦 TO: " + result.to_wallet);
      appendLog("🔒 STATUS: LOCKED (PENDING)");
    } catch (err: any) {
      appendLog("❌ ERROR: " + err.message);
    }
  };

  // =============================
  // 🟠 3. SELLER APPROVE
  // =============================
 const handleApprove = async () => {
  const signer = await getSigner();
  const seller = await signer.getAddress();

  const transfer = data;

  if (seller.toLowerCase() !== transfer.from_wallet.toLowerCase()) {
    appendLog("❌ NOT SELLER");
    return;
  }

  const contract = new ethers.Contract(
    transfer.contract_address,
    ABI,
    signer
  );

  const tx = await contract.approve(
    transfer.to_wallet,
    transfer.token_id
  );

  await tx.wait();

  appendLog("✅ APPROVED");
};
 

const handleTransfer = async () => {
  try {
    if (!data) return appendLog("❌ No data");

    appendLog("🔌 Buyer transferring...");


    const checkRes = await fetch("/api/resale/check-pending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket_id: ticketId }),
    });

    const check = await checkRes.json();
    console.log(check.transfer_id)
    console.log("CHECK =", check);

    if (!check.ok) {
      appendLog("❌ BLOCKED: BE NOT READY");
      return;
    }

    const transfer = check.transfer;

    if (!transfer?.contract_address) {
      appendLog("❌ CONTRACT NULL");
      return;
    }
if (transfer.from_wallet === transfer.to_wallet) {
  appendLog("❌ BLOCK SELF TRANSFER");
  return;
}
    const signer = await getSigner();
    const buyer = await signer.getAddress();
console.log("METAMASK SENDER =", await signer.getAddress());
console.log("EXPECTED FROM =", transfer.from_wallet);
console.log("EXPECTED TO =", transfer.to_wallet);

if (!transfer?.from_wallet || !transfer?.to_wallet) {
  appendLog("❌ INVALID TRANSFER");
  return;
}

    console.log("SIGNER =", buyer);
    console.log("FROM =", transfer.from_wallet);
    console.log("TO =", transfer.to_wallet);

    const contract = new ethers.Contract(
      transfer.contract_address,
      ABI,
      signer
    );

    const owner = await contract.ownerOf(transfer.token_id);

    appendLog("👑 OWNER: " + owner);

    if (owner.toLowerCase() !== transfer.from_wallet.toLowerCase()) {
      appendLog("❌ OWNER MISMATCH");
      return;
    }

    appendLog("🚀 TRANSFER START...");

    const tx = await contract.transferFrom(
      transfer.from_wallet,
      transfer.to_wallet,
      transfer.token_id
    );

    await tx.wait();

    appendLog("✅ DONE: " + tx.hash);

    const confirm = await fetch("/api/resale/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transfer_id: transfer.transfer_id,
        tx_hash: tx.hash,
      }),
    });

    const result = await confirm.json();

    if (!confirm.ok) {
      appendLog("❌ CONFIRM FAIL");
      return;
    }
console.log("FINAL TRANSFER =", {
  from: transfer.from_wallet,
  to: transfer.to_wallet,
  token: transfer.token_id,
  contract: transfer.contract_address
});
    appendLog("🎉 SUCCESS COMPLETE");

  } catch (err: any) {
    appendLog("❌ ERROR: " + err.message);
  }
};

  return (
    <div style={{ padding: 20 }}>
      <h2>🔥 Resale Flow (FIXED - SAFE VERSION)</h2>

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