
import { headers } from 'next/headers';
import { SidebarTrigger } from './ui/sidebar'
import { SearchWithDropdown } from './search-with-dropdown';
import { UserInfo } from './user-info';
import { NotificationRoomProvider } from '@/liveblocks/notification-room-provider';
import { NotificationListener } from '@/liveblocks/notification-listener';
import { auth } from '@/lib/auth';
import { NotificationPopover } from './notification-popover';

export const AppHeader = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const userId = session?.user?.id;

    const headerContent = (
        <header className=' flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background'>

            <div className=' flex items-center gap-4'>
                <SidebarTrigger />
                <SearchWithDropdown isLoading = {false} list={[]} />
            </div>

            <div className='flex items-center justify-end gap-3'>
                <NotificationPopover/>
                <UserInfo/>
            </div>
        </header>
    );

    if (!userId) {
        return headerContent;
    }

    return (
        <NotificationRoomProvider userId={userId}>
            <NotificationListener/>
            {headerContent}
        </NotificationRoomProvider>
    )
}
