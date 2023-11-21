"use client"

import { useRouter } from "next/navigation"

import { ITicket } from "@/interfaces/ITicket"
import useTicket from "@/hooks/support/useTicket"
import { twMerge } from "tailwind-merge"
import { useEffect, useState } from "react"
import { find } from "lodash"
import { pusherClient } from "@/libs/pusher"

interface MobileSidebarProps {
  initialTickets: ITicket[]
}

export function MobileSidebar({ initialTickets }: MobileSidebarProps) {
  const router = useRouter()

  const [tickets, setTickets] = useState(initialTickets)

  // TODO - go to /support/tickets on esc

  useEffect(() => {
    pusherClient.subscribe("tickets")

    const messagehandler = (ticket: ITicket) => {
      setTickets(current => {
        if (find(current, { id: ticket.id })) {
          return current
        }

        return [...current, ticket]
      })
    }
    pusherClient.bind("tickets:new", messagehandler)

    return () => {
      pusherClient.unsubscribe("tickets")
      pusherClient.unbind("tickets:new", messagehandler)
    }
  }, [tickets])

  const { isOpen } = useTicket()

  return (
    <aside className={twMerge(`block laptop:hidden w-full h-full`, isOpen && "hidden")}>
      <nav className="flex flex-col gap-y-4 justify-center items-center px-16">
        {tickets?.map(ticket => (
          <li
            className="relative w-full border border-border-color text-center pl-4 pr-8 py-2"
            key={ticket.id}
            onClick={() => router.push(`/support/tickets/${ticket.id}`)}>
            <h3 className="font-semibold truncate">{ticket.owner_username}</h3>
            <div
              className="before:absolute before:w-[25px] before:h-[25px] before:bg-info before:rounded-full
        before:right-2 before:translate-y-[-100%] before:z-[9]
        after:absolute after:w-[20px] after:h-[20px] after:text-title-foreground
        after:right-2.5 after:translate-y-[-120%] after:z-[9] after:content-['99']"
            />
          </li>
        ))}

        {/* TODO - create case if messages more then 99 - show 99 */}

        {/* UNREAD (sort - unread first) */}
        <div className="w-full border border-border-color text-subTitle text-center px-4 py-2">Username</div>
        <div className="w-full border border-border-color text-subTitle text-center px-4 py-2">Username</div>
        <div className="w-full border border-border-color text-subTitle text-center px-4 py-2">Username</div>
        <div className="w-full border border-border-color text-subTitle text-center px-4 py-2">Username</div>
        <div className="w-full border border-border-color text-subTitle text-center px-4 py-2">Username</div>
        <div className="w-full border border-border-color text-subTitle text-center px-4 py-2">Username</div>
      </nav>
    </aside>
  )
}
