import {
    Building2,
    Users,
    Globe,
    Heart,
    Lightbulb,
    Rocket,
} from "lucide-react";
import { OrganizationCard } from "./organization-card";

export const OrganizationItem = () => {
    const organizations = [
            {
                id: 1,
                name: "Tech Innovators Inc.",
                description:
                    "Leading the future of technology with cutting-edge AI and machine learning solutions.",
                logo: Building2,
                // Color used for the small logo circle and text accent
                color: "text-blue-500",
                bgColor: "bg-blue-100", // Light background for the logo circle
            },
            {
                id: 2,
                name: "Global Health Alliance",
                description:
                    "Committed to improving healthcare access and outcomes worldwide.",
                logo: Heart,
                color: "text-red-500",
                bgColor: "bg-red-100",
            },
            {
                id: 3,
                name: "EcoWorld Foundation",
                description:
                    "Dedicated to environmental conservation and sustainable development initiatives.",
                logo: Globe,
                color: "text-green-500",
                bgColor: "bg-green-100",
            },
            {
                id: 4,
                name: "Creative Minds Studio",
                description:
                    "Fostering creativity and innovation through collaborative design projects.",
                logo: Lightbulb,
                color: "text-yellow-600",
                bgColor: "bg-yellow-100",
            },
            {
                id: 5,
                name: "Community Builders",
                description:
                    "Building stronger communities through social programs and volunteer initiatives.",
                logo: Users,
                color: "text-purple-500",
                bgColor: "bg-purple-100",
            },
            {
                id: 6,
                name: "Startup Accelerator",
                description:
                    "Empowering entrepreneurs and helping startups reach their full potential.",
                logo: Rocket,
                color: "text-indigo-500",
                bgColor: "bg-indigo-100",
            },
        ];
    
        // Helper function to simulate a "Pinned" state
        const isPinned = (orgId: number) => orgId % 3 === 0;
    return (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {organizations.map((org) => {
                            const LogoIcon = org.logo;
                            const pinned = isPinned(org.id);
        
                            return (
                                <OrganizationCard
                                    key={org.id}
                                    id={org.id}
                                    name={org.name}
                                    description={org.description}
                                    logo={LogoIcon}
                                    color={org.color}
                                    bgColor={org.bgColor}
                                    pinned={pinned}
                                />
                            );
                        })}
                    </div>
    )
}
