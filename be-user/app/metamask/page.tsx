"use client";

import { useState } from "react";
import { ethers } from "ethers";

export default function PaymentTestPage() {
  const [wallet, setWallet] = useState("");
  const [provider, setProvider] = useState<any>(null);
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // CONNECT METAMASK
  // =========================
  const connectWallet = async () => {
    try {
      const ethereum = (window as any).ethereum;

      if (!ethereum) {
        alert("MetaMask not found");
        return;
      }

      // 🔥 ép về Sepolia
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // 11155111
      });

      // 🔥 lấy account
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      const newProvider = new ethers.BrowserProvider(ethereum);
      setProvider(newProvider);

      const signer = await newProvider.getSigner();
      const address = await signer.getAddress();

      console.log("CONNECTED:", address);

      setWallet(address);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // CREATE PAYMENT (API)
  // =========================
  const createPayment = async () => {
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        order_id: "D67E1869-29FA-48B0-91AD-933DC1EBA3CF",
        from_wallet: wallet, // ✅ KHÔNG hardcode
        to_wallet: process.env.NEXT_PUBLIC_SYSTEM_WALLET,
      }),
    });

    const data = await res.json();
    setPaymentId(data.data.payment_id);

    console.log("PAYMENT ID:", data.data.payment_id);
  };

  // =========================
  // PAY
  // =========================
  const pay = async () => {
    try {
      setLoading(true);

      if (!provider) {
        alert("Connect wallet first");
        return;
      }

      const ethereum = (window as any).ethereum;

      // 🔥 ép lại Sepolia trước khi send
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      // ================= DEBUG =================
      console.log("SIGNER:", address);

      const network = await provider.getNetwork();
      console.log("CHAIN ID:", network.chainId);

      const balance = await provider.getBalance(address);
      console.log("BALANCE:", ethers.formatEther(balance));
      // ========================================

      // ❌ sai network → chặn luôn
   if (Number(network.chainId) !== 11155111) {
  alert("Please switch to Sepolia");
  return;
}

      // ❌ không đủ tiền
      if (balance < ethers.parseEther("0.00002")) {
        alert("Not enough ETH");
        return;
      }

      console.log("STEP 1 - before send tx");
      console.log("FROM:", address);
      console.log("TO:", process.env.NEXT_PUBLIC_SYSTEM_WALLET);

      // ================= SEND TX =================
      const tx = await signer.sendTransaction({
        to: process.env.NEXT_PUBLIC_SYSTEM_WALLET!,
        value: ethers.parseEther("0.00001"),
      });

      console.log("TX SENT:", tx.hash);

      const receipt = await tx.wait();

      console.log("MINED:", receipt.hash);

      // ================= CONFIRM API =================
      await fetch("/api/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: paymentId,
          tx_hash: receipt.hash,
        }),
      });

      alert("Payment success!");
    } catch (err) {
      console.error("PAY ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: 20 }}>
      <h2>💳 Payment Test (Sepolia FIXED)</h2>

      <button onClick={connectWallet}>
        🔗 Connect MetaMask
      </button>

      <p>Wallet: {wallet}</p>

      <hr />

      <button onClick={createPayment}>
        1. Create Payment
      </button>

      <p>Payment ID: {paymentId}</p>

      <hr />

      <button onClick={pay} disabled={loading}>
        {loading ? "Processing..." : "2. Pay"}
      </button>
    </div>
  );
}