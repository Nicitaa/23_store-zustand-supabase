import { IMessage } from "@/interfaces/support/IMessage"
import supabaseAdmin from "@/libs/supabase/supabaseAdmin"
import { cache } from "react"

const isClosed = cache(async (ticketId: string) => {
  const { data: is_closed_response } = await supabaseAdmin.from("tickets").select("is_open").eq("id", ticketId).single()
  return is_closed_response
})

const getInitialMessagesByTicketId = async (ticketId: string): Promise<IMessage[]> => {
  // Check is this ticket closed
  // Don't needed error because if it will check ticketId from cookies - this ticketId doesn't exist
  // in DB cause I create ticket in DB on first message sent

  const is_closed_response = await isClosed(ticketId)
  if (is_closed_response?.is_open === false) {
    // if this ticket already completed - return empty array
    return []
  }

  const { data: messages_by_id_response, error: messages_by_id_error } = await supabaseAdmin
    .from("messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true })
  if (messages_by_id_error) console.log(8, "messages_by_id_error - ", messages_by_id_error.message)
  if (messages_by_id_response?.length === 0 || messages_by_id_response === null) return []
  return messages_by_id_response
}
export default getInitialMessagesByTicketId
