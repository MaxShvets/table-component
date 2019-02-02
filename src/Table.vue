<template>
    <div class="table-container">
        <div class="filter-panel">
            <label
                v-for="(_, columnName) in filters"
                :key="columnName"
                :for="columnName + 'column'"
            >
                {{ columns[columnName] }} contains
                <input :id="columnName + 'column'" v-model="filters[columnName]">
                <button @click="removeFilter(columnName)">Remove</button>
            </label>
            <div class="add-filter" v-if="unfilteredColumns.length">
                <button @click="addFilter">Add filter</button>
                <label for="unfiltered-columns"> for </label>
                <select id="unfiltered-columns" v-model="columnToFilter">
                    <option
                        v-for="columnName in unfilteredColumns"
                        :key="columnName"
                        :value="columnName"
                    >
                        {{ columns[columnName] }}
                    </option>
                </select>
            </div>
        </div>
        <table>
            <tr>
                <th v-for="(titleText, columnName) in columns"
                    :key="columnName"
                    @click="resort(columnName)"
                    v-bind:class="{
                        'sort-column': columnName === sortBy,
                        ascending: columnName === sortBy && isSortAscending
                    }"
                >
                    {{ titleText }}
                </th>
            </tr>
            <tr v-for="item in currentPageContent" :key="item.name">
                <td v-for="(_, propertyName) in columns" :key="propertyName">
                    <input v-model.lazy="item[propertyName]">
                </td>
            </tr>
        </table>
        <Pagination
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-select="changePage"
        ></Pagination>
    </div>
</template>

<script>
    import Vue from 'vue';
    import Pagination from './Pagination';

    export default {
        name: 'Table',
        props: {
            itemsPerPage: Number,
            columns: Object,
            items: Array
        },
        data() {
            return {
                currentPage: 1,
                sortBy: '',
                isSortAscending: true,
                filters: {},
                columnToFilter: Object.keys(this.columns)[0]
            }
        },
        computed: {
            displayedItems() {
                const {items} = this;
                return [...items]
                    .filter(this.filterItem.bind(this))
                    .sort(this.createComparator());
            },
            currentPageContent() {
                const {itemsPerPage, currentPage} = this;
                return this.displayedItems.slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage)
            },
            totalPages() {
                return Math.ceil(this.displayedItems.length / this.itemsPerPage)
            },
            unfilteredColumns() {
                return Object.keys(this.columns).filter(column => !(column in this.filters))
            }
        },
        methods: {
            changePage(newPage) {
                this.currentPage = newPage;
            },
            createComparator() {
                const {sortBy, isSortAscending} = this;
                const multiplier = isSortAscending ? 1 : -1;
                return sortBy
                    ? (item, otherItem) => {
                        let result;
                        if (otherItem[sortBy] < item[sortBy]) {
                            result = 1;
                        } else if (item[sortBy] < otherItem[sortBy]) {
                            result = -1;
                        } else {
                            result = 0;
                        }

                        return multiplier * result;
                    }
                    : () => 0
            },
            resort(columnName) {
                const {sortBy, isSortAscending} = this;
                if (columnName === sortBy) {
                    this.sortBy = isSortAscending ? sortBy : "";
                    this.isSortAscending = !isSortAscending;
                } else {
                    this.sortBy = columnName;
                    this.isSortAscending = true;
                }
            },
            filterItem(item) {
                return !Object.keys(this.filters)
                    .map(columnName => item[columnName].includes(this.filters[columnName]))
                    .includes(false)
            },
            addFilter() {
                Vue.set(this.filters, this.columnToFilter, '');
                this.columnToFilter = this.unfilteredColumns[0];
            },
            removeFilter(columnName) {
                Vue.delete(this.filters, columnName);

            }
        },
        components: {
            Pagination
        }
    }
</script>

<style scoped>
    .add-filter {
        display: inline-block;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    td, th {
        border: 1px solid #000;
    }

    th {
        cursor: pointer;
    }

    .sort-column:after {
        content: "\2191";
    }

    .sort-column.ascending:after {
        content: "\2193";
    }
</style>
