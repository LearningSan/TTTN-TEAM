"use client";

import { useState } from "react";
import { ethers } from "ethers";

export default function PaymentTestPage() {
  const [wallet, setWallet] = useState("");
  const [provider, setProvider] = useState<any>(null);
  const [paymentId, setPaymentId] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================
  // CONNECT METAMASK + SAVE WALLET
  // =========================
 const connectWallet = async () => {
  try {
    const ethereum = (window as any).ethereum;

    if (!ethereum) {
      alert("MetaMask not found");
      return;
    }

    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xaa36a7" }],
    });

    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });

    const address = accounts[0];

    // ✅ FIX: set provider
    const newProvider = new ethers.BrowserProvider(ethereum);
    setProvider(newProvider);

    setWallet(address);

    // ===== nonce → sign → verify =====
    const nonceRes = await fetch("/api/wallet/nonce", {
      credentials: "include",
    });

    const { message } = await nonceRes.json();

    const signature = await ethereum.request({
      method: "personal_sign",
      params: [message, address],
    });

    const verifyRes = await fetch("/api/wallet/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        wallet_address: address,
        signature,
        message,
      }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      alert(verifyData.message);
      return;
    }

    alert("Kết nối ví thành công");

  } catch (err) {
    console.error(err);
  }
};
  // =========================
  // CREATE PAYMENT
  // =========================
  const createPayment = async () => {
    if (!wallet) {
      alert("Connect wallet first");
      return;
    }

    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        order_id: "1306D64B-A223-4AD8-9724-53CB2C7921C5",
        from_wallet: wallet,
        to_wallet: process.env.NEXT_PUBLIC_SYSTEM_WALLET,
      }),
    });

    const data = await res.json();


if (!res.ok) {
  console.error("Payment API error:", data);
  alert(data.message || "Create payment failed");
  return;
}

if (!data?.data?.payment_id) {
  console.error("Invalid response:", data);
  alert("Invalid payment response");
  return;
}

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

      if (!paymentId) {
        alert("Create payment first");
        return;
      }

      const ethereum = (window as any).ethereum;

      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });

      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);

      console.log("CHAIN:", network.chainId);
      console.log("BALANCE:", ethers.formatEther(balance));

      if (Number(network.chainId) !== 11155111) {
        alert("Please switch to Sepolia");
        return;
      }   

      // ================= CHECK BALANCE API =================
      const checkRes = await fetch("/api/check-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_wallet: address,
          amount: ethers.parseEther("0.00001").toString(),
        }),
      });

      const checkData = await checkRes.json();

      if (!checkData.has_enough_balance) {
        alert("Not enough ETH (including gas)");
        return;
      }

      // ================= SEND TX =================
      const tx = await signer.sendTransaction({
        to: process.env.NEXT_PUBLIC_SYSTEM_WALLET!,
        value: ethers.parseEther("0.00001"),
      });

      console.log("TX:", tx.hash);

      const receipt = await tx.wait();

      // ================= CONFIRM =================
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
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <div style={{ padding: 20 }}>
      <h2>💳 Payment Test (Full Flow)</h2>

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