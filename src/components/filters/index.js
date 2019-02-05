import ContainsFilter from "./ContainsFilter";
import RangeFilter from "./RangeFilter";

export const availableFilters = Object.freeze({
    range: {
        applicableTo: ["number"],
        create(data = {}) {
            return {
                data,
                component: RangeFilter,
                apply(value) {
                    const {from, to} = this.data;
                    return value !== undefined && (!from || from <= value) && (!to || value <= to);
                }
            }
        }
    },
    contains: {
        applicableTo: ["text", "number"],
        create(data = {value: ""}) {
            return {
                data,
                component: ContainsFilter,
                apply(value) {
                    return value && value.toString().includes(this.data.value)
                }
            }
        }
    }
});

export function createFilter(filterType, initialData) {
    return availableFilters[filterType].create(initialData);
}

/**
 * @param value - any value to be filtered
 * @param filters - object with entries of the form filterType: filterObject
 * @returns {boolean}
 */

export function applyFilters(value, filters) {
    return !Object.keys(filters)
        .map(filterType => filters[filterType].apply(value))
        .includes(false)
}

/**
 * @param row - object with entries of the form columnName: value
 * @param filters - object with entries of the form columnName: filters, where filters is of the form defined in
 * applyFilters function
 */

export function applyFiltersToRow(row, filters) {
    return !Object.keys(filters)
        .map(columnName => applyFilters(row[columnName], filters[columnName]))
        .includes(false);
}

export function getFiltersForColumnType(columnType) {
    return Object.keys(availableFilters)
        .filter(filterType => (
            availableFilters[filterType].applicableTo.includes(columnType)
        ))
}
