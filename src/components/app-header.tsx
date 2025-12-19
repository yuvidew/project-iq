
import { SidebarTrigger } from './ui/sidebar'
import { SearchWithDropdown } from './search-with-dropdown';
import { UserInfo } from './user-info';

export const AppHeader = () => {
    return (
        <header className=' flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background'>

            <div className=' flex items-center gap-4'>
                <SidebarTrigger />
                <SearchWithDropdown />
            </div>

            <div>

            <UserInfo user={{
                name: "shadcn",
                email: "m@example.com",
                avatar: "/avatars/shadcn.jpg",
            }} />
            </div>
        </header>
    )
}