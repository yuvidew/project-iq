import React from 'react'
import { Button } from '@/components/ui/button';

interface OrganizationPaginationProps {
    page : number;
    totalPages: number;
    onPageChange : (page:number) => void;
    disabled?: boolean 
}

/**
 * Renders previous/next pagination controls alongside the current page summary.
 * @param page Current page number (1-indexed).
 * @param totalPages Total page count available.
 * @param onPageChange Handler invoked with the next page to load.
 * @param [disabled] Optional flag to disable navigation buttons.
 * @example
 * ```tsx
 * <OrganizationPagination page={page} totalPages={20} onPageChange={setPage} />
 * ```
 */
export const OrganizationPagination = ({
    page,
    totalPages,
    onPageChange,
    disabled 
}: OrganizationPaginationProps) => {
    return (
        <div className='flex items-center justify-between gap-x-2'>
            <div className=' flex-1 text-sm text-muted-foreground'>
                Page {page} of {totalPages || 1}
            </div>

            <div className=' flex items-center justify-end space-x-2'>
                <Button
                    disabled = {page === 1 || disabled}
                    variant={"outline"}
                    size={"sm"}
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                >
                    Previous
                </Button>
                <Button
                    disabled = {page === totalPages || totalPages === 0 || disabled}
                    variant={"outline"}
                    size={"sm"}
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
