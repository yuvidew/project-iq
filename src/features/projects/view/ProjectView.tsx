"use client";

import {  FilterSection, ProjectsPagination, ProjectsWrapper, ProjectLists } from '../_components/projects';


export const ProjectView = () => {
    return (
        <ProjectsWrapper
            pagination = {<ProjectsPagination/>}
            filterSection = {<FilterSection/>}
        >
            <ProjectLists/>
        </ProjectsWrapper>
    )
}
