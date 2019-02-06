import AddFilterBlock from './AddFilterBlock';

export default {
    name: 'FiltersPanel',
    render() {
        return (
            <div className="filter-panel">
                {this.filters.map((columnName, filterType, filter) => (
                    <filter.component
                        key={`${columnName}-${filterType}-filter`}
                        {...{props: filter.data}}
                        columnTitle={this.getColumnTitle(columnName)}
                        on-remove-filter={() => this.removeFilter(columnName, filterType)}
                        on-input={newData => this.updateFilter(columnName, filterType, newData)}
                    />
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
            return columnData.title;
        },
        addFilter(columnName, filterType, filter) {
            this.$emit('input', this.filters.setFilter(columnName, filterType, filter));
        },
        removeFilter(columnName, filterType) {
            this.$emit('input', this.filters.removeFilter(columnName, filterType));
        },
        updateFilter(columnName, filterType, newData) {
            const filter = this.filters.getFilter(columnName, filterType);
            filter.data = newData;
            this.$emit('input', this.filters.setFilter(columnName, filterType, filter));
        }
    }
}