"use client"

import * as React from "react"
import { Monitor, Smartphone, Terminal, CreditCard, Layout } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function ThemeSwitcher() {
    const { setTheme, theme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Monitor className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Monitor className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Tema Modu</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Layout className="mr-2 h-4 w-4" />
                    Açık (Minimal)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Layout className="mr-2 h-4 w-4" />
                    Koyu (Standart)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" />
                    Sistem
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuLabel>Özel Temalar</DropdownMenuLabel>

                <DropdownMenuItem onClick={() => setTheme("fintech")}>
                    <CreditCard className="mr-2 h-4 w-4 text-purple-500" />
                    Fintech (Modern)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("terminal")}>
                    <Terminal className="mr-2 h-4 w-4 text-green-500" />
                    Terminal (Bloomberg)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
