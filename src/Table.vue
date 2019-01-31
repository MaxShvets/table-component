<template>
    <div class="table-container">
        <table>
            <tr>
                <th v-for="(titleText, columnName) in titles"
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
            <tr v-for="item in displayedData" :key="item.name">
                <td v-for="(_, propertyName) in titles" :key="propertyName">
                    {{ item[propertyName] }}
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
    import Pagination from './Pagination';

    export default {
        name: 'Table',
        props: {
            itemsPerPage: Number,
            titles: Object,
            items: Array
        },
        data() {
            return {
                currentPage: 1,
                sortBy: '',
                isSortAscending: true
            }
        },
        computed: {
            displayedData() {
                const {itemsPerPage, items, currentPage} = this;
                return [...items]
                    .sort(this.createComparator())
                    .slice(itemsPerPage * (currentPage - 1), itemsPerPage * currentPage)
            },
            totalPages() {
                return Math.ceil(this.items.length / this.itemsPerPage)
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
            }
        },
        components: {
            Pagination
        }
    }
</script>

<style scoped>
    table {
        margin: 0 auto;
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
