<template>
    <div class="table-container">
        <div class="filter-panel">
            <label
                v-for="(_, columnName) in filters"
                :key="columnName"
                :for="columnName + 'column'"
                class="filter-block"
            >
                {{ columns[columnName] }} contains
                <input type="text" :id="columnName + 'column'" v-model="filters[columnName]">
                <button class="remove-filter" @click="removeFilter(columnName)">
                    &#x2715;
                </button>
            </label>
            <div class="filter-block add-filter-block" v-if="unfilteredColumns.length">
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
        <table cellspacing="0">
            <tr>
                <th v-for="(titleText, columnName) in columns"
                    :key="columnName"
                    @click="resort(columnName)"
                    v-bind:class="{
                        'sorted-column': columnName === sortBy,
                        ascending: columnName === sortBy && isSortAscending
                    }"
                >
                    <span>{{ titleText }}</span>
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
            const firstColumn = Object.keys(this.columns)[0];

            return {
                currentPage: 1,
                sortBy: firstColumn,
                isSortAscending: true,
                filters: {},
                columnToFilter: firstColumn
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

<style lang="less" scoped>
    .table-container {
        font-family: Arial, sans-serif;
    }

    .filter-block {
        border: 1px solid;
        border-radius: 5px;
        display: inline-block;
        padding: 5px;
        margin: 5px 10px 5px 0;

        &, input[type="text"] {
            font-size: 15px;
        }

        input[type="text"] {
            border: none;
            border-bottom: 1px solid;
            outline: none;
            margin-right: 3px;
        }
    }

    .add-filter-block {
        border: none;
        padding-left: 0;

        button, select {
            font-size: 15px;
        }

        button {
            background: none;
            border-radius: 5px;
            border: 1px solid #000;
            outline: none;
        }
    }

    .remove-filter {
        @button-side-length: 20px;
        position: relative;
        width: @button-side-length;
        height: @button-side-length;
        border-radius: 100%;
        border: 1px solid #000;
        padding: 0 0 1px 0;
    }

    table {
        width: 100%;
        border-radius: 5px;
        border: 1px solid #000;
        overflow: hidden;
    }

    tr, td, th {
        padding: 0;
    }

    tr, td input {
        height: 25px;
    }

    td, th {
        border-style: solid;
        border-color: #000;
        border-width: 0 1px 1px 0;
    }

    tr {
        td:last-child, th:last-child {
            border-right: 0;
        }

        &:last-child td {
            border-bottom: 0;
        }
    }

    th {
        background-color: #b0e2ff;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
    }

    td input {
        width: 100%;
        border: none;
        box-sizing: border-box;
        padding: 0 0 0 2px;
    }

    .sorted-column {
        @arrow-side-length: 5px;

        span {
            position: relative;
        }

        span:after {
            content: "";
            position: absolute;
            width: @arrow-side-length;
            height: @arrow-side-length;
            transform: rotate(135deg);
            top: 5px;
            right: -10px;
            border-style: solid;
            border-color: #000;
            border-width: 1px 1px 0 0;
        }

        &.ascending span:after {
            transform: rotate(-45deg);
            top: 7px;
        }
    }
</style>
