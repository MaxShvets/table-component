<template>
    <div class="table-container">
        <FilterPanel
            :columns="normalizedColumns"
            :filters="filters"
            v-model="filters"
        ></FilterPanel>

        <table v-if="currentPageContent.length" cellspacing="0">
            <tr>
                <ColumnHeading
                    v-for="(columnData, columnName) in normalizedColumns"
                    :key="columnName"
                    :sorted="columnName === sortBy"
                    :ascending="columnName === sortBy && isSortAscending"
                    :title="columnData.title"
                    @click="resort(columnName)"
                ></ColumnHeading>
            </tr>

            <tr v-for="row in currentPageContent" :key="row.num">
                <TableCell
                    v-for="cell in row.cells"
                    :key="cell.columnName"
                    v-bind="cell"
                    @click="setCurrentlyEditedCell(row.num, cell.columnName)"
                    @change="updateCellValue($event, row.num, cell.columnName)"
                    @focusout="unsetCurrentlyEditedCell"
                ></TableCell>
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
    import Vue from "vue";
    import Pagination from "./components/Pagination";
    import ColumnHeading from "./components/ColumnHeading";
    import TableCell from "./components/TableCell";
    import FilterPanel from "./components/filters/FiltersPanel";
    import {basicComparator} from "./helpers/basic-comparator";
    import {columnTypes, validateInputType, normalizeColumns} from "./column-types";
    import createFilterCollection from "./components/filters/FilterCollection"

    export default {
        name: 'Table',
        props: {
            rowsPerPage: Number,
            columns: {
                type: Object,
                validator(columns) {
                    return Object.keys(columns).map(columnName => {
                        const columnType = columns[columnName].type;
                        !columnType || validateInputType(columnType)
                    });
                }
            },
            rows: Array
        },
        data() {
            const firstColumn = Object.keys(this.columns)[0];
            const normalizedColumns = normalizeColumns(this.columns);

            return {
                currentPage: 1,
                sortBy: firstColumn,
                isSortAscending: true,
                normalizedColumns,
                filters: createFilterCollection(normalizedColumns),
                currentlyEditedCell: null
            }
        },
        computed: {
            displayedRows() {
                const {rows} = this;
                return rows
                    .map((item, i) => ({values: item, num: i}))
                    .filter(({values}) => this.filters.apply(values))
                    .sort(this.createComparator())
                    .map(row => ({
                        cells: Object.keys(this.normalizedColumns).map(columnName => ({
                            columnName,
                            value: row.values[columnName],
                            valueType: this.columns[columnName].type,
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
                    ? ({values}, {values: otherValues}) => {
                        const value = values[sortBy];
                        const otherValue = otherValues[sortBy];
                        return multiplier * basicComparator(value, otherValue);
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
            updateCellValue(event, rowNum, columnName) {
                const updatedRow = this.rows[rowNum];
                const newValue = event.target.value;
                if (newValue !== "") {
                    updatedRow[columnName] = this.isNumericCell(columnName) ? parseFloat(newValue) : newValue;
                } else {
                    delete updatedRow[columnName];
                }
                const updatedRows = [...this.rows];
                updatedRows[rowNum] = updatedRow;
                this.$emit('input', updatedRows);
            },
            isNumericCell(columnName) {
                return this.columns[columnName].type === columnTypes.number;
            }
        },
        components: {
            Pagination,
            ColumnHeading,
            TableCell,
            FilterPanel
        },
        watch: {
            columns: {
                handler: function(newColumns) {
                    Vue.set(this, "normalizedColumns", normalizeColumns(newColumns));
                    Vue.set(this, "filters", createFilterCollection(this.normalizedColumns));
                },
                deep: true
            }
        }
    }
</script>

<style lang="less" scoped>
    .table-container {
        font-family: Arial, sans-serif;
    }

    table {
        width: 100%;
        border-radius: 5px;
        border: 1px solid #000;
        overflow: hidden;
    }

    tr {
        height: 25px;
    }

    tr, td, th {
        padding: 0;
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
</style>
