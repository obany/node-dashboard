export interface SearchInputProps {
    /**
     * Class names.
     */
    className?: string;

    /**
     * The query to search for.
     */
    onSearch: (query: string) => void;
}
