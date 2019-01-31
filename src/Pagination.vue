<template>
    <div class="pagination" v-if="1 < totalPages">
        <span
            v-for="item in paginationItems"
            :key="item.id"
            @click="item.handleClick"
            :class="{
                'pagination-item': item.isClickable,
                'current-page': item.isCurrentPage
            }"
        >
            {{ item.text }}
        </span>
    </div>
</template>

<script>
    export default {
        name: "Pagination",
        props: {
            currentPage: Number,
            totalPages: Number
        },
        computed: {
            paginationItems() {
                const {currentPage, totalPages} = this;
                const pagesUntilLast = totalPages - currentPage;
                return [
                    [currentPage !== 1, 1], // first page
                    [3 < currentPage, null, "..."],
                    [2 < currentPage, currentPage - 1], // previous page
                    [true, currentPage], // current page
                    [1 < pagesUntilLast, currentPage + 1], // next page
                    [2 < pagesUntilLast, null, "..."],
                    [currentPage !== totalPages, totalPages] // last page
                ].filter(
                    ([shouldRender]) => shouldRender
                ).map(([ , correspondingPage, text], index) => ({
                    id: index,
                    text: correspondingPage || text,
                    handleClick: () => this.handlePageClick(correspondingPage),
                    isCurrentPage: correspondingPage === currentPage,
                    isClickable: !!correspondingPage
                }))
            }
        },
        methods: {
            handlePageClick(pageNum) {
                pageNum !== this.currentPage && this.$emit("page-select", pageNum)
            }
        }
    }
</script>

<style scoped>
    span {
        display: inline-block;
        margin: auto 3px;
    }

    .pagination {
        text-align: center;
    }

    .pagination .pagination-item {
        text-decoration: underline;
        cursor: pointer;
    }

    .current-page {
        font-weight: bold;
    }
</style>