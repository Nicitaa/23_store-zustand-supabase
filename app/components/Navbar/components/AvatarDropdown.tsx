"use client"
import Image from "next/image"

import { BsWindow } from "react-icons/bs"
import { TbWorld } from "react-icons/tb"
import { FiPhoneCall } from "react-icons/fi"

import useUserStore from "@/store/user/userStore"
import useDarkMode from "@/store/ui/darkModeStore"
import LogoutDropdownItem from "./LogoutDropdownItem"
import { SwitchDarkMode } from "@/components"
import { contact } from "@/constant/contacts"
import { DropdownContainer, DropdownItem } from "@/components/ui"
import { useRouter } from "next/navigation"
import useAvatarDropdownClose from "@/hooks/ui/useAvatarDropdownClose"

export function AvatarDropdown() {
  const router = useRouter()
  const { isDropdown, openDropdown, closeDropdown, toggle, avatarDropdownRef } = useAvatarDropdownClose()
  const userStore = useUserStore()
  const mode = useDarkMode()

  function openAdminPanel() {
    router.push("?modal=AdminPanel")
    closeDropdown()
  }

  function openChangeLanguageModal() {
    router.push("?modal=ChangeLanguage")
    closeDropdown()
  }

  return (
    <DropdownContainer
      isDropdown={isDropdown}
      toggle={toggle}
      dropdownRef={avatarDropdownRef}
      classNameDropdownContainer="ml-1"
      className="max-w-[200px]"
      username={userStore.username}
      icon={
        <>
          <Image
            className="w-[32px] h-[32px] rounded-full"
            src={userStore.avatarUrl ? userStore.avatarUrl : "/placeholder.jpg"}
            alt="user logo"
            width={32}
            height={32}
          />
        </>
      }>
      <DropdownItem label="Admin panel" icon={BsWindow} onClick={openAdminPanel} />
      <DropdownItem
        className="flex justify-center mobile:hidden"
        label="Support"
        icon={FiPhoneCall}
        href={contact.telegram}
        target="_blank"
      />
      <DropdownItem label="Change language" icon={TbWorld} onClick={openChangeLanguageModal} />
      <DropdownItem
        className="min-[501px]:hidden"
        label="Dark mode"
        icon={SwitchDarkMode}
        onClick={mode.toggleDarkMode}
      />
      <LogoutDropdownItem />
    </DropdownContainer>
  )
}
