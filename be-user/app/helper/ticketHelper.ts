

import { getTickets, getTicketById,getTicketsByUserId } from "@/app/lib/ticket";
import { getOrderItems } from "../lib/order";
import { createTicket } from "@/app/lib/ticket";
import { ethers } from "ethers";
import { abi } from "../lib/abi";


function getContract() {
  const rpc = process.env.RPC_URL;
  const key = process.env.PRIVATE_KEY;
  const address = process.env.CONTRACT_ADDRESS;

  if (!rpc || !key || !address) {
    throw new Error("Missing env RPC_URL / PRIVATE_KEY / CONTRACT_ADDRESS");
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(key, provider);

  return new ethers.Contract(address, abi, wallet);
}

export async function getTicketsService(params: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    return await getTickets(params);
  } catch (error: any) {
    console.error("getTicketsService error:", error);
    throw new Error(error.message || "Failed to fetch tickets");
  }
}

export async function getTicketByIdService(ticket_id: string) {
  try {
    const ticket = await getTicketById(ticket_id);
    if (!ticket) {
      throw new Error(`Ticket not found: ${ticket_id}`);
    }
    return ticket;
  } catch (error: any) {
    console.error("getTicketByIdService error:", error);
    throw new Error(error.message || "Failed to fetch ticket by ID");
  }
}
export async function getTicketByUserIdService(user_id: string) {
  try {
    const tickets = await getTicketsByUserId(user_id);

    if (!tickets  ) {
      throw new Error(`Tickets not found for user: ${user_id}`);
    }

    return tickets;
  } catch (error: any) {
    console.error("getTicketByUserIdService error:", error);
    throw new Error(error.message || "Failed to fetch tickets by User ID");
  }
}


export async function createTicketsFromOrder(payment: any) {
  const { order_id, user_id, concert_id, payment_id, from_wallet } = payment;

  const items = await getOrderItems(order_id);

  const contract = getContract();

  const createdTickets: any[] = [];

  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {

      const tx = await contract.mint(from_wallet);
      const receipt = await tx.wait();

      const parsed = receipt.logs
        .map((log: any) => {
          try {
            return contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((e: any) => e && e.name === "Transfer");

      if (!parsed) throw new Error("Cannot get tokenId");

      const tokenId = parsed.args.tokenId.toString();

      const ticketId = await createTicket({
        order_id,
        order_item_id: item.order_item_id,
        user_id,
        concert_id,
        zone_id: item.zone_id,
        seat_id: item.seat_id,
        payment_id,
        wallet_address: from_wallet,
        tier_id: item.tier_id,
        token_id: tokenId,
        mint_tx_hash: tx.hash,
        contract_address: process.env.CONTRACT_ADDRESS!,
      });

      createdTickets.push({ ticketId, tokenId });
    }
  }

  return createdTickets;
}