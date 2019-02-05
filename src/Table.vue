<template>
    <div class="table-container">
        <div class="filter-panel">
            <ColumnFilter
                v-for="(_, columnName) in filters"
                :key="columnName"
                :filteredColumnTitle="getColumnTitle(columnName)"
                @remove-filter="removeFilter(columnName)"
                v-model="filters[columnName]"
            ></ColumnFilter>

            <AddFilterBlock
                :columns="columns"
                :filters="filters"
                @filter-added="addFilter"
            ></AddFilterBlock>
        </div>

        <table v-if="currentPageContent.length" cellspacing="0">
            <tr>
                <ColumnHeading
                    v-for="(columnData, columnName) in columns"
                    :key="columnName"
                    :sorted="columnName === sortBy"
                    :ascending="columnName === sortBy && isSortAscending"
                    :title="columnData.title || columnData"
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
    import Vue from 'vue';
    import Pagination from './components/Pagination';
    import ColumnHeading from './components/ColumnHeading';
    import TableCell from './components/TableCell';
    import ColumnFilter from './components/ColumnFilter';
    import AddFilterBlock from './components/AddFilterBlock';

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
                            isValueNumeric: this.columns[columnName].isNumeric,
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
                        let result;

                        if (value === undefined && otherValue !== undefined) {
                            result = 1;
                        } else if (otherValue === undefined && value !== undefined) {
                            result = -1;
                        } else if (otherValue < value) {
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
            addFilter(filteredColumn) {
                Vue.set(this.filters, filteredColumn, '');
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
            updateCellValue(event, rowNum, columnName) {
                const {[columnName]: _, ...updatedCell} = this.rows[rowNum];
                const newValue = event.target.value;
                if (newValue !== "") {
                    updatedCell[columnName] = this.isNumericCell(columnName) ? parseFloat(newValue) : newValue;
                }
                const updatedRows = [...this.rows];
                updatedRows[rowNum] = updatedCell;
                this.$emit('input', updatedRows);
            },
            isNumericCell(columnName) {
                return this.columns[columnName].isNumeric
            },
            getColumnTitle(columnName) {
                return this.columns[columnName].title || this.columns[columnName];
            }
        },
        components: {
            Pagination,
            ColumnHeading,
            TableCell,
            ColumnFilter,
            AddFilterBlock
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
