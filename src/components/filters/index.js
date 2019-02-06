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

export function getFiltersForColumnType(columnType) {
    return Object.keys(availableFilters)
        .filter(filterType => (
            availableFilters[filterType].applicableTo.includes(columnType)
        ))
}
