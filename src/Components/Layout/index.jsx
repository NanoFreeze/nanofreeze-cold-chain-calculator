import { useState } from "react"
import SideBar from "../SideBar"

const Layout = ({ children }) => {

    const [sideBarExpanded, setSideBarExpanded] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--color-soft-grey)]">
            <SideBar
                isExpanded={sideBarExpanded}
                onToggle={setSideBarExpanded}
            />

            <div className={`flex flex-col flex-1 transition-all duration-300 
                ${sideBarExpanded ? "pl-[240px]" : "pl-[72px]"}`}>

                <main className="flex flex-col flex-1 min-h-0 p-8 overflow-y-auto scrollbar-thin scrollbar-track-white scrollbar-thumb-grey scrollbar-thumb-rounded-full">
                    {children}
                </main>
            </div>
        </div>
    )
}

export default Layout