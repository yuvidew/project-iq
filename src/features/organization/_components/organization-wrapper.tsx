import { Button } from '@/components/ui/button'
import { FolderOpenIcon } from 'lucide-react'
import { CreateOrganizationForm } from './create-organization-form';

interface OrganizationWrapperProps {
    search: React.ReactNode;
    pagination: React.ReactNode;
    children: React.ReactNode;
}

/**
 * Layout wrapper for the organization directory page sections.
 * @param search Search box component node.
 * @param pagination Pagination controls component node.
 * @param children Main content node containing cards/list.
 * @example
 * ```tsx
 * <OrganizationWrapper
 *   search={<SearchBox />}
 *   pagination={<Pagination />}
 * >
 *   <OrganizationList />
 * </OrganizationWrapper>
 * ```
 */
export const OrganizationWrapper = ({ search, pagination, children }: OrganizationWrapperProps) => {
    return (
        <main className="h-screen  py-12 px-4">
            <div className="max-w-7xl mx-auto flex flex-col gap-6 h-full">
                <section className="flex flex-col items-start justify-start ">
                    <Button size="icon">
                        <FolderOpenIcon />
                    </Button>
                    <h1 className="text-xl font-bold  mb-4 mt-5">
                        ProjectIQ Organization Directory
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        A centralized directory for discovering, organizing, and analyzing
                        all organizations connected with ProjectIQ.
                    </p>
                </section>


                <section className=" flex flex-col gap-4 h-full">

                    {/* start to search box */}
                    <div className=' flex items-center justify-end gap-3'>
                        {search}

                        {/* start to create organization button */}
                        <CreateOrganizationForm/>
                        {/* end to create organization button */}
                    </div>
                    {/* end to search box */}

                    {children}


                    {/* start to pagination */}
                    {pagination}
                    {/* end to pagination */}
                </section>
            </div>
        </main>
    )
}
