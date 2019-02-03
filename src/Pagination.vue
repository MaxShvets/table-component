<template>
    <div class="pagination" v-if="1 < totalPages">
        <button
            v-for="item in paginationItems"
            :key="item.id"
            @click="item.handleClick"
            :class="['pagination-item', {
                'current-page': item.isCurrentPage
            }]"
            :disabled="!item.isClickable"
        >
            {{ item.text }}
        </button>
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
                pageNum && pageNum !== this.currentPage && this.$emit("page-select", pageNum)
            }
        }
    }
</script>

<style lang="less" scoped>
    .pagination {
        text-align: center;
        margin: 10px 0;

        &-item {
            display: inline-block;
            margin: 0 3px;
            cursor: pointer;
            border-radius: 5px;
            outline: none;
        }

        &-item[disabled] {
            cursor: default;
            border: none;
            background: none;
        }
    }

    .current-page {
        font-weight: bold;
        background-color: #b0e2ff;
    }
</style>