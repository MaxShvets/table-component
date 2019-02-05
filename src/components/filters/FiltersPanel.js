import AddFilterBlock from './AddFilterBlock';

export default {
    name: 'FiltersPanel',
    render() {
        return (
            <div className="filter-panel">
                {Object.entries(this.filters).map(([columnName, columnFilters]) => (
                    Object.entries(columnFilters).map(([filterType, filter]) => (
                        <filter.component
                            key={`${columnName}-${filterType}-filter`}
                            {...{props: filter.data}}
                            columnTitle={this.getColumnTitle(columnName)}
                            on-remove-filter={() => this.removeFilter(columnName, filterType)}
                            on-input={newData => this.updateFilter(columnName, filterType, newData)}
                        />
                    ))
                ))}

                <AddFilterBlock
                    columns={this.columns}
                    filters={this.filters}
                    on-filter-added={this.addFilter}
                />
            </div>
        );
    },
    props: {
        filters: {
            type: Object,
            required: true
        },
        columns: {
            type: Object,
            required: true
        }
    },
    methods: {
        getColumnTitle(columnName) {
            const columnData = this.columns[columnName];
            return columnData.title || columnData;
        },
        addFilter(filteredColumn, filterType, filter) {
            const newFiltersForColumn = Object.assign({}, this.filters[filteredColumn]);
            newFiltersForColumn[filterType] = filter;
            this.$emit('input', {...this.filters, [filteredColumn]: newFiltersForColumn})
        },
        removeFilter(columnName, filterType) {
            const {...updatedFilters} = this.filters;
            delete updatedFilters[columnName][filterType];
            if (Object.keys(updatedFilters[columnName]).length === 0) {
                delete updatedFilters[columnName];
            }
            this.$emit('input', updatedFilters)
        },
        updateFilter(columnName, filterType, newData) {
            const {...updatedFilters} = this.filters;
            const {...filter} = updatedFilters[columnName][filterType];
            filter.data = newData;
            updatedFilters[columnName][filterType] = filter;
            this.$emit('input', updatedFilters);
        }
    }
}