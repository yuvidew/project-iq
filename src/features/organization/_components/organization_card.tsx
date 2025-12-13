import React from 'react';
import { PinIcon } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'; 
import { Button } from '@/components/ui/button'; 

interface OrganizationCardProps {
    id: number;
    name: string;
    description: string;
    logo: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    color: string;
    bgColor: string;
    pinned: boolean;
}

/**
 * Card presenting organization info with a pin action and CTA button.
 * @param id Unique identifier for list rendering.
 * @param name Organization display name.
 * @param description Short summary text.
 * @param logo SVG React component used as the org logo.
 * @param color Tailwind text color class applied to the logo.
 * @param bgColor Tailwind background color class for the logo circle.
 * @param pinned Whether the organization is pinned.
 * @example
 * ```tsx
 * <OrganizationCard
 *   id={1}
 *   name="Acme Inc."
 *   description="Tools for modern teams."
 *   logo={LogoIcon}
 *   color="text-blue-600"
 *   bgColor="bg-blue-50"
 *   pinned={true}
 * />
 * ```
 */
export const OrganizationCard = ({ id, name, description, logo: LogoIcon, color, bgColor, pinned }: OrganizationCardProps) => {
    
    const primaryButtonColor = color.replace('text', 'bg').replace('-500', '-700').replace('-600', '-700');

    return (
        <Card
            key={id}
            className="rounded-xl  border border-primary flex flex-col shadow-none duration-300"
        >
            <CardHeader className="flex flex-row items-center justify-between pb-0">
                <div className={`w-10 h-10 rounded-full ${bgColor} flex items-center justify-center p-1 border border-gray-200`}>
                    <LogoIcon className={`w-6 h-6 ${color}`} strokeWidth={2} />
                </div>

                <Button
                    variant="outline"
                    className={`h-auto text-sm font-medium px-3 py-1.5 rounded-full transition-colors duration-200 
                        ${pinned 
                            ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200' 
                            : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'
                        }`}
                    aria-label={pinned ? "Unpin organization" : "Pin organization"}
                >
                    {pinned ? (
                        <span className="flex items-center">
                            <PinIcon className="w-4 h-4 mr-1 fill-current rotate-45" />
                            Pinned
                        </span>
                    ) : (
                        <span className="flex items-center">
                            <PinIcon className="w-4 h-4 mr-1 rotate-45" />
                            Pin
                        </span>
                    )}
                </Button>
            </CardHeader>

            <CardContent className=" pt-4 flex-grow">
                <CardTitle className="text-xl font-medium text-gray-900 mb-2">
                    {name}
                </CardTitle>
                {/* Description as CardDescription */}
                <p className="text-gray-600 text-sm leading-relaxed">
                    {description}
                </p>
            </CardContent>

            <CardFooter className=" pt-0 border-t border-gray-100 mt-auto">
                <Button
                    className={`w-full py-2.5 rounded-lg text-white font-semibold shadow-md transition-transform duration-150 transform hover:scale-[1.01]`}
                    style={{ backgroundColor: primaryButtonColor }}
                    aria-label={`View details for ${name}`}
                >
                    View Details
                </Button>
            </CardFooter>

        </Card>
    );
}
