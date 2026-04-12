

import { getTickets, getTicketById } from "@/app/lib/ticket";
import { getOrderItems } from "../lib/order";
import { createTicket } from "@/app/lib/ticket";
export async function getTicketsService() {
  try {
    const tickets = await getTickets();
    return tickets;
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




export async function createTicketsFromOrder(payment: any, transaction?: any) {
  const { order_id, user_id, concert_id, payment_id } = payment;
  const items = await getOrderItems(order_id);
  for (const item of items) {
    for (let i = 0; i < item.quantity; i++) {
      try {
        await createTicket(
          {
            order_id,
            order_item_id: item.order_item_id,
            user_id,
            concert_id,
            zone_id: item.zone_id,
            seat_id: item.seat_id,
            payment_id,
          },
          transaction
        );
      } catch (error: any) {
        if (error.message.includes("Violation of UNIQUE KEY constraint")) {
          console.warn(`Duplicate ticket detected for order_item_id=${item.order_item_id}, skipping.`);
        } else {
          throw error; 
        }
      }
    }
  }
}