<template>
    <div class="table-container">
        <div class="filter-panel">
            <label
                v-for="(_, columnName) in filters"
                :key="columnName"
                class="filter-block"
            >
                {{ getColumnTitle(columnName) }} contains
                <input type="text" v-model="filters[columnName]">
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
                        {{ getColumnTitle(columnName) }}
                    </option>
                </select>
            </div>
        </div>
        <table v-if="currentPageContent.length" cellspacing="0">
            <tr>
                <th v-for="(columnData, columnName) in columns"
                    :key="columnName"
                    @click="resort(columnName)"
                    v-bind:class="{
                        'sorted-column': columnName === sortBy,
                        ascending: columnName === sortBy && isSortAscending
                    }"
                >
                    <span>{{ columnData.title || columnData }}</span>
                </th>
            </tr>
            <tr v-for="row in currentPageContent" :key="row.num">
                <td
                    v-for="cell in row.cells"
                    :key="cell.columnName"
                    @click="setCurrentlyEditedCell(row.num, cell.columnName)"
                >
                    <input
                        v-if="cell.value !== undefined || cell.isCurrentlyEdited"
                        :type="cell.isNumeric ? 'number' : 'text'"
                        @change="updateCellValue($event, row.num, cell)"
                        @focusout=""
                        :value="cell.value"
                        v-focus="cell.isCurrentlyEdited"
                    >
                    <span v-else class="missing-value">unknown</span>
                </td>
            </tr>
        </table>
        <div v-else class="no-rows-message">
            {{ noDataMessage }}
        </div>
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
            rowsPerPage: Number,
            columns: Object,
            rows: Array
        },
        data() {
            const firstColumn = Object.keys(this.columns)[0];

            return {
                currentPage: 1,
                sortBy: firstColumn,
                isSortAscending: true,
                filters: {},
                columnToFilter: firstColumn,
                currentlyEditedCell: null
            }
        },
        computed: {
            displayedRows() {
                const {rows} = this;
                return rows
                    .map((item, i) => ({values: item, num: i}))
                    .filter(this.filterRow.bind(this))
                    .sort(this.createComparator())
                    .map(row => ({
                        cells: Object.keys(this.columns).map(columnName => ({
                            columnName,
                            value: row.values[columnName],
                            isNumeric: this.columns[columnName].isNumeric,
                            isCurrentlyEdited: this.isCurrentlyEditedCell(row.num, columnName)
                        })),
                        num: row.num
                    }));
            },
            currentPageContent() {
                const {rowsPerPage, currentPage} = this;
                return this.displayedRows.slice(rowsPerPage * (currentPage - 1), rowsPerPage * currentPage)
            },
            totalPages() {
                return Math.ceil(this.displayedRows.length / this.rowsPerPage)
            },
            unfilteredColumns() {
                return Object.keys(this.columns).filter(column => !(column in this.filters))
            },
            noDataMessage() {
                return this.rows.length
                    ? "There is no data matching the filters"
                    : "There is no data to display";
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
                    ? (row, otherRow) => {
                        const value = row.values[sortBy];
                        const otherValue = otherRow.values[sortBy];
                        let result;
                        if (otherValue < value) {
                            result = 1;
                        } else if (value < otherValue) {
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
            filterRow({values}) {
                return !Object.keys(this.filters)
                    .map(columnName => (
                        values.hasOwnProperty(columnName)
                        && values[columnName].toString().includes(this.filters[columnName]
                    )))
                    .includes(false)
            },
            addFilter() {
                Vue.set(this.filters, this.columnToFilter, '');
                this.columnToFilter = this.unfilteredColumns[0];
            },
            removeFilter(columnName) {
                Vue.delete(this.filters, columnName);

            },
            setCurrentlyEditedCell(row, column) {
                this.currentlyEditedCell = {row, column};
            },
            unsetCurrentlyEditedCell() {
                this.currentlyEditedCell = null;
            },
            isCurrentlyEditedCell(row, column) {
                if (!this.currentlyEditedCell) {
                    return false;
                }

                const {row: currentRow, column: currentColumn} = this.currentlyEditedCell;
                return row === currentRow && column === currentColumn;
            },
            updateCellValue(event, rowNum, cell) {
                const columnName = cell.columnName;
                const {[columnName]: _, ...updatedCell} = this.rows[rowNum];
                const newValue = event.target.value;
                if (newValue !== "") {
                    updatedCell[columnName] = cell.isNumeric ? parseFloat(newValue) : newValue;
                }
                const updatedRows = [...this.rows];
                updatedRows[rowNum] = updatedCell;
                this.$emit('input', updatedRows);
            },
            getColumnTitle(columnName) {
                return this.columns[columnName].title || this.columns[columnName];
            }
        },
        components: {
            Pagination
        },
        directives: {
            focus: {
                inserted(el, binding) {
                    binding.value && el.focus();
                }
            }
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

    td input, .missing-value {
        padding: 0 0 0 2px;
    }

    td input {
        width: 100%;
        border: none;
        box-sizing: border-box;
    }

    .missing-value {
        font-size: 11px;
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
