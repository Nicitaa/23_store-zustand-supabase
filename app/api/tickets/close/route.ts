import { NextResponse } from "next/server"

import supabaseAdmin from "@/libs/supabaseAdmin"
import { pusherServer } from "@/libs/pusher"
import { ITicket } from "@/interfaces/ITicket"

export type TAPITicketsClose = {
  ticketId: string
}

export async function POST(req: Request) {
  const { ticketId } = (await req.json()) as TAPITicketsClose

  const { error } = await supabaseAdmin.from("tickets").update({ is_open: false }).eq("id", ticketId)
  if (error) return NextResponse.json({ error: `Error in api/tickets/route.ts\n ${error.message}` }, { status: 400 })
  await pusherServer.trigger("tickets", "tickets:close", {
    id: ticketId,
    is_open: false,
  } as ITicket)
  // separate event is required for action when support close ticket (if you chane event to tickets:close it will not work)
  await pusherServer.trigger(ticketId, "tickets:closeBySupport", null)

  return NextResponse.json({ message: "Ticket marked as completed (ticket closed)" }, { status: 200 })
}
