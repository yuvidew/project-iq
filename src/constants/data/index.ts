import { AlertTriangleIcon, CheckCircle2Icon, FolderOpenIcon, UsersIcon } from 'lucide-react';

export const cards = [
        {
            title: 'Total Projects',
            value: '0',
            subtitle: 'projects in yuvraj dewangan',
            icon: FolderOpenIcon,
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            title: 'Completed Projects',
            value: '0',
            subtitle: 'of 0 total',
            icon: CheckCircle2Icon,
            iconColor: 'text-green-500',
            bgColor: 'bg-green-500/10'
        },
        {
            title: 'My Tasks',
            value: '0',
            subtitle: 'assigned to me',
            icon: UsersIcon,
            iconColor: 'text-purple-500',
            bgColor: 'bg-purple-500/10'
        },
        {
            title: 'Overdue',
            value: '0',
            subtitle: 'need attention',
            icon: AlertTriangleIcon,
            iconColor: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10'
        }
    ];