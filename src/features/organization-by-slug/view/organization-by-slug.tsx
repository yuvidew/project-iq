import { CreateNewProject } from '../../../components/create-new-project';
import { AlertTriangleIcon,  CheckCircle2Icon, FolderOpenIcon, UsersIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InProgress, MyTask, Overdue, ProjectOverview, RecentActivityTask } from '../_components/organization-by-slug';





export const OrganizationBySlug = () => {

    return (
        <main className='p-6 flex flex-col gap-9 '>
            {/* start to create new project section  */}
            <section className=' flex items-start justify-between'>
                <div className='flex flex-col gap-2'>
                    <h1 className=' text-3xl font-semibold'>Welcome back, <span className=' text-primary'>yuvi</span></h1>
                    <p className=' text-sm text-muted-foreground'>Here's what's happening with your projects today</p>
                </div>

                <CreateNewProject />

            </section>
            {/* end to create new project section  */}

            {/* start to progress card */}
            {/* TODO: add the actual data get from the api  */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ">
                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-medium">
                                Total Projects
                            </h3>
                            <div className={`bg-blue-500/10 p-2 rounded-lg`}>
                                <FolderOpenIcon className={`w-5 h-5 text-blue-500`} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-bold ">
                                0
                            </p>
                            <p className="text-gray-500 text-xs">
                                projects in yuvraj dewangan
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-medium">
                                Completed Projects
                            </h3>
                            <div className={`bg-green-500/10 p-2 rounded-lg`}>
                                <CheckCircle2Icon className={`w-5 h-5 text-green-500`} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-bold ">
                                0
                            </p>
                            <p className="text-gray-500 text-xs">
                                of 0 total
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-medium">
                                My Tasks
                            </h3>
                            <div className={`bg-purple-500/10 p-2 rounded-lg`}>
                                <UsersIcon className={`w-5 h-5 text-purple-500`} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-bold ">
                                0
                            </p>
                            <p className="text-gray-500 text-xs">
                                assigned to me
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className=" rounded-sm"
                >
                    <CardContent className="">
                        <div className="flex items-start justify-between mb-4">
                            <h3 className="text-gray-400 text-sm font-medium">
                                Overdue
                            </h3>
                            <div className={`bg-yellow-500/10 p-2 rounded-lg`}>
                                <AlertTriangleIcon className={`w-5 h-5 text-yellow-500`} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-bold ">
                                0
                            </p>
                            <p className="text-gray-500 text-xs">
                                need attention
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </section>
            {/* start to progress card */}

            {/* start to  next section*/}
            <div className=' grid lg:grid-cols-3 grid-cols-1 gap-5'>
                {/* start to project overview and recent project */}
                <div className=' lg:col-span-2 flex flex-col gap-5'>
                    <ProjectOverview/>
                    <RecentActivityTask/>
                </div>
                {/* end to project overview and recent project */}
                <div className='flex flex-col gap-5'>
                    <MyTask/>
                    <Overdue/>
                    <InProgress/>
                </div>
            </div>
            {/* end to  next section*/}
        </main>
    )
}
