"use client"

import { IMessage } from "@/interfaces/IMessage"
import useDarkMode from "@/store/ui/darkModeStore"
import useUserStore from "@/store/user/userStore"
import { formatTime } from "@/utils/formatTime"
import { getCookie } from "@/utils/helpersCSR"
import Image from "next/image"
import { twMerge } from "tailwind-merge"

interface MessageBoxProps {
  isLast: boolean
  data: IMessage
}

export function MessageBox({ isLast, data }: MessageBoxProps) {
  const userStore = useUserStore()
  const { isDarkMode } = useDarkMode()

  const userId = userStore.userId === "" ? getCookie("anonymousId") : userStore.userId
  const isOwn = userId === data.sender_id

  const message = twMerge(isOwn ? "bg-info text-title" : "bg-foreground")

  return (
    <div className={twMerge(`flex gap-x-2`, isOwn && "justify-end")}>
      <Image
        className="rounded-full select-none pointer-events-none order-last"
        src={
          userStore.isAuthenticated
            ? userStore.avatarUrl
              ? userStore.avatarUrl
              : "/placeholder.jpg"
            : isDarkMode
            ? "/BiUserCircle-dark.svg"
            : "/BiUserCircle-light.svg"
        }
        alt="user-image"
        width={46}
        height={46}
      />
      <div className="flex flex-col items-end px-1 py-0.5">
        <p className="text-xs">{formatTime(data.created_at)}</p>
        <p
          className="relative border-2 text-end w-fit text-title-foreground px-2 py-0.5 bg-info rounded-lg
         before:w-3 before:h-3 before:bg-info before:border-l-2 before:border-t-2 before:border-solid before:border-border-color
       before:rotate-[195deg] before:rounded-r-full before:absolute before:translate-y-[150%] before:right-[-6px] before:translate-x-[-50%]">
          {data.body}
        </p>
      </div>
    </div>
  )
}
