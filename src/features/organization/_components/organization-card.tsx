"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; 
import { Button } from '@/components/ui/button'; 
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import Link from 'next/link';
import { SquareArrowOutUpRightIcon, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface OrganizationCardProps {
    id: number;
    name: string;
    description: string | null;
    createdAt: Date;
    slug: string;
    logoUrl: string | null;
    ownerId: string;
    onRename?: (org: {
        id: number;
        name: string;
        description: string | null;
        slug: string;
        logoUrl: string | null;
    }) => void;
    onDelete?: (id: number) => void;
}

/**
 * Card presenting organization info with a pin action and CTA button.
 * @param id Unique identifier for list rendering.
 * @param name Organization display name.
 * @param description Short summary text.
 * @param slug URL slug for the organization.
 * @param logoUrl URL of the organization logo.
 * @param createdAt Creation timestamp.
 * @param updatedAt Last update timestamp.
 * @param onRename Optional callback for rename action.
 * @param onDelete Optional callback for delete action.
 * @example
 * ```tsx
 * <OrganizationCard
 *   id={1}
 *   name="Acme Inc."
 *   description="Tools for modern teams."
 *   slug="acme-inc"
 *   logoUrl="/logos/acme.png"
 *   createdAt={new Date()}
 *   updatedAt={new Date()}
 *   ownerId="user123"
 *   onRename={(id) => console.log('Rename', id)}
 *   onDelete={(id) => console.log('Delete', id)}
 * />
 * ```
 */
export const OrganizationCard = ({ 
    id, 
    name, 
    description, 
    logoUrl, 
    slug,
    createdAt,
    onRename,
    onDelete
}: OrganizationCardProps) => {

    const router = useRouter();
    
    const handleRename = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onRename?.({
            id,
            name,
            description,
            slug,
            logoUrl,
        });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete?.(id);
    };

    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
        
        if (diffInSeconds < 60) {
            return "just now";
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} min ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 31536000) {
            const months = Math.floor(diffInSeconds / 2592000);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        } else {
            const years = Math.floor(diffInSeconds / 31536000);
            return `${years} year${years > 1 ? 's' : ''} ago`;
        }
    };

    return (
        <Card
            key={id}
            className="rounded-md border border-primary flex flex-col shadow-none duration-300"
        >
            <CardHeader className="flex flex-row items-start justify-between pb-0">
                {logoUrl && (
                    <div className="w-15 h-15 flex items-center justify-center border border-primary rounded-md overflow-hidden">
                        <Image
                            src={logoUrl}
                            alt={slug}
                            width={400}
                            height={500}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label="Organization options"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={handleRename}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={handleDelete}
                            className="text-destructive focus:text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>

            <CardContent className="pt-4 flex-grow">
                <CardTitle className="text-xl font-medium mb-2">
                    {name}
                </CardTitle>
                <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                </p>
            </CardContent>

            <CardFooter className="pt-0 border-t mt-auto">
                <div className="flex items-center justify-between w-full">
                    <p className="text-xs text-muted-foreground">
                        {getTimeAgo(createdAt)}
                    </p>
                    <div>
                            <Button
                                aria-label={`View details for ${name}`}
                                size="icon"
                                onClick={() => router.push(`/organizations/${id}`)}
                            >
                                <SquareArrowOutUpRightIcon className="h-4 w-4" />
                            </Button>
                    </div> 
                </div>
            </CardFooter>
        </Card>
    );
}
