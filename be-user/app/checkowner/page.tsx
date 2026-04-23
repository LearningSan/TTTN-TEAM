"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { abi } from "@/app/lib/abi";

// 👉 nhớ sửa lại contract address của bạn
const CONTRACT_ADDRESS = "0xe18A3E241f5c4eCace19D91aDD29B92087Cf89e0";

export default function CheckOwnerPage() {
  const [tokenId, setTokenId] = useState("");
  const [log, setLog] = useState("");

  const appendLog = (msg: string) => {
    setLog((prev) => prev + "\n" + msg);
  };

  const getProvider = async () => {
    const provider = new ethers.BrowserProvider(
      (window as any).ethereum
    );
    await provider.send("eth_requestAccounts", []);
    return provider;
  };

  const handleCheck = async () => {
    try {
      setLog("");

      if (!tokenId) {
        appendLog("❌ Nhập token_id");
        return;
      }

      appendLog("🔌 Connecting wallet...");

      const provider = await getProvider();
      const signer = await provider.getSigner();
      const currentWallet = await signer.getAddress();

      appendLog("👤 Current wallet: " + currentWallet);

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abi,
        provider
      );

      appendLog("🔍 Checking owner...");

      const owner = await contract.ownerOf(tokenId);

      appendLog("📦 Token ID: " + tokenId);
      appendLog("👑 Owner (on chain): " + owner);

      if (owner.toLowerCase() === currentWallet.toLowerCase()) {
        appendLog("✅ Bạn đang giữ NFT này");
      } else {
        appendLog("❌ Bạn KHÔNG phải owner");
      }

    } catch (err: any) {
      appendLog("❌ ERROR: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🔍 Check NFT Owner</h2>

      <input
        placeholder="Nhập token_id"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
      />

      <br /><br />

      <button onClick={handleCheck}>
        👉 Check Owner
      </button>

      <pre style={{ marginTop: 20 }}>{log}</pre>
    </div>
  );
}