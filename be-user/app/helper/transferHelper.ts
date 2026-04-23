import { connectDB } from "../lib/data";
import {
  checkPendingTransfer,
  insertTransfer,
  getTransferById,
  markTransferSuccess,
} from "../lib/transfer";
import { getUserById } from "../lib/user";
import { updateTicketOwner, getTicketForUpdate, updateTicketStatus } from "../lib/ticket";
import { ethers } from "ethers";
import { abi } from "../lib/abi";

// =============================
// 🔥 CREATE TRANSFER
// =============================
export async function createTransferTransaction(
  ticket_id: string,
  buyer_id: string
) {
  const pool = await connectDB();
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    const ticket = await getTicketForUpdate(ticket_id, transaction);

    if (!ticket) throw new Error("Ticket not found");
    if (ticket.user_id === buyer_id)
      throw new Error("Cannot buy your own ticket");
    if (ticket.used_at) throw new Error("Ticket already used");
    if (ticket.status !== "TRANSFERRED")
      throw new Error("Ticket not transferred");
    if (!ticket.token_id) throw new Error("Ticket not minted");

    const isPending = await checkPendingTransfer(ticket_id, transaction);
    if (isPending) throw new Error("Ticket is being transferred");

    const buyer = await getUserById(buyer_id, transaction);

    if (!buyer) throw new Error("Buyer not found");
    if (buyer.status !== "ACTIVE")
      throw new Error("Buyer not active");
    if (!buyer.wallet_address)
      throw new Error("Buyer has no wallet");

    const price = ticket.subtotal / ticket.quantity;

    const transfer_id = await insertTransfer(
      {
        ticket_id,
        from_user_id: ticket.user_id,
        to_user_id: buyer_id,
        from_wallet: ticket.wallet_address,
        to_wallet: buyer.wallet_address,
      },
      transaction
    );

    await transaction.commit();

    return {
      transfer_id,
      price,
      from_wallet: ticket.wallet_address,
      to_wallet: buyer.wallet_address,
      token_id: ticket.token_id,
      contract_address: ticket.contract_address,
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

let contractRead: ethers.Contract | null = null;

export function getContractRead() {
  if (contractRead) return contractRead;

  const address = process.env.CONTRACT_ADDRESS;
  if (!address) throw new Error("Missing CONTRACT_ADDRESS");

  const provider = getProvider();
  contractRead = new ethers.Contract(address, abi, provider);

  return contractRead;
}

let provider: ethers.JsonRpcProvider | null = null;

function getProvider() {
  if (provider) return provider;

  if (!process.env.RPC_URL) {
    throw new Error("Missing RPC_URL");
  }

  provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  return provider;
}


export async function verifyNFTTransfer(
  tx_hash: string,
  transfer: any
) {
  const receipt = await getProvider().getTransactionReceipt(tx_hash);

  if (!receipt) throw new Error("Transaction not found");
  if (receipt.status !== 1)
    throw new Error("Transaction failed");

  let isValid = false;

  for (const log of receipt.logs) {
    try {
      const contract = getContractRead();
      const parsed = contract.interface.parseLog(log);

      if (!parsed) continue;
      if (parsed.name !== "Transfer") continue;

      const from = parsed.args.from.toLowerCase();
      const to = parsed.args.to.toLowerCase();
      const tokenId = parsed.args.tokenId.toString();

      console.log("🔍 EVENT:", { from, to, tokenId });

      console.log("🎯 EXPECT:", {
        from: transfer.from_wallet,
        to: transfer.to_wallet,
        tokenId: transfer.token_id,
      });

      if (
        from === transfer.from_wallet.toLowerCase() &&
        to === transfer.to_wallet.toLowerCase() &&
        tokenId === String(transfer.token_id)
      ) {
        isValid = true;
        break;
      }
    } catch {
      // ignore log không phải của contract
    }
  }

  if (!isValid) {
    throw new Error("Invalid NFT transfer");
  }

  return receipt;
}


export async function confirmTransferService(
  transfer_id: string,
  tx_hash: string
) {
  const transfer = await getTransferById(transfer_id);

  if (!transfer) throw new Error("Transfer not found");

  if (transfer.transfer_status !== "PENDING") {
    throw new Error("Transfer already processed");
  }

  const ticket = await getTicketForUpdate(transfer.ticket_id);

  if (!ticket || !ticket.token_id) {
    throw new Error("Ticket token not found");
  }

  transfer.token_id = ticket.token_id;

  const receipt = await verifyNFTTransfer(tx_hash, transfer);

  const pool = await connectDB();
  const transaction = pool.transaction();

  try {
    await transaction.begin();

    // update transfer SUCCESS
    await markTransferSuccess(
      transfer_id,
      tx_hash,
      receipt.blockNumber,
      transaction
    );

    // update ticket owner
    await updateTicketOwner(
      transfer.ticket_id,
      transfer.to_user_id,
      transfer.to_wallet,
      transaction
    );
  await updateTicketStatus(
  transfer.ticket_id,
  "ACTIVE",
  transaction
   );

    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }

  return {
    success: true,
    transfer_id,
    tx_hash,
    block_number: receipt.blockNumber,
  };
}