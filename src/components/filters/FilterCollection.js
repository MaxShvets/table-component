import {getFiltersForColumnType} from "./index";

export default function createFilterCollection(columns, predefinedFilters) {
    const self = {};
    const filters = predefinedFilters || {};

    const copyAndMutate = function (performMutation) {
        const {...filtersCopy} = filters;
        performMutation(filtersCopy);
        return createFilterCollection(columns, filtersCopy);
    };

    self.getFilter = function(column, filterType) {
        return {...filters[column][filterType]};
    };

    self.setFilter = function(column, filterType, filter) {
        return copyAndMutate(filtersCopy => {
            filtersCopy[column] = filtersCopy[column] || {};
            filtersCopy[column][filterType] = filter
        });
    };

    self.removeFilter = function(column, filterType) {
        return copyAndMutate(filtersCopy => {
            delete filtersCopy[column][filterType];
            Object.keys(filtersCopy).length === 0 && delete filtersCopy[column];
        });
    };

    const testAllKeys = function(object, test) {
        return !Object.keys(object).map(test).includes(false);
    };

    /**
     * @param value - any value to be filtered
     * @param filters - object with entries of the form filterType: filterObject
     * @returns {boolean}
     */

    const applyFilters = function(value, filters) {
        return testAllKeys(filters, filterType => filters[filterType].apply(value));
    };

    /**
     * @param row - object with entries of the form columnName: value
     * @returns {boolean}
     */

    self.apply = function (row) {
        return testAllKeys(filters, columnName => applyFilters(row[columnName], filters[columnName]))
    };

    self.map = function(cb) {
        return Object.entries(filters).map(([columnName, columnFilters]) => (
            Object.entries(columnFilters).map(([filterType, filter]) => (
                cb(columnName, filterType, filter)
            ))
        ));
    };

    self.getAvailableFiltersForColumn = function(column) {
        const availableFilters = getFiltersForColumnType(columns[column].type || "text");
        const currentFilters = filters[column] || {};
        return availableFilters.filter(filterType => !(filterType in currentFilters));
    };

    return self;
}