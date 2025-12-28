"use client";
import { PAGINATION } from "@/lib/config";
import { useEffect, useState } from "react";

interface UseProjectSearchProps<T extends {search : string, page: number}>{
    params : T;
    setParams: (params : T) => void;
    debounceMs? : number
}   

/**
 * Debounced search hook that keeps params in sync and resets pagination on change.
 * @param params Current Project params containing `search` and `page`.
 * @param setParams Setter invoked with updated params when the debounce completes.
 * @param [debounceMs=500] Debounce duration in milliseconds.
 * @example
 * ```tsx
 * const { searchValue, onSearchChange } = useProjectSearch({ params, setParams });
 * <ProjectSearch value={searchValue} onChange={onSearchChange} />
 * ```
 */
export function useProjectSearch<T extends {
    search : string;
    page : number;
}> ({
    params,
    setParams,
    debounceMs = 500
}: UseProjectSearchProps<T>){
    const [localSearch, setLocalSearch] = useState(params.search);

    useEffect(() => {
        if (localSearch === "" && params.search !== "" ) {
            setParams({
                ...params,
                search : "",
                page : PAGINATION.DEFAULT_PAGE,
            });

            return;
        }
        const timer = setTimeout(() => {
            if (localSearch !== params.search) {
                setParams({
                    ...params,
                    search : localSearch,
                    page: PAGINATION.DEFAULT_PAGE,
                });
            }
        }, debounceMs)

        return () => clearTimeout(timer)
    } , [localSearch, params, setParams, debounceMs])

    useEffect(() => {
        setLocalSearch(params.search);
    } , [params.search]);

    return {
        searchValue : localSearch,
        onSearchChange : setLocalSearch 
    }
}
