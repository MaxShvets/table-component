<template>
    <div class="filter-block add-filter-block" v-if="unfilteredColumns.length">
        <button @click="addFilter">Add filter</button>
        <label>
            for
            <select v-model="selectedColumn">
                <option
                    v-for="columnName in unfilteredColumns"
                    :key="columnName"
                    :value="columnName"
                >
                    {{ columns[columnName].title || columns[columnName] }}
                </option>
            </select>
        </label>
        <label>
            of type
            <select v-model="selectedFilterType">
                <option
                    v-for="filterType in availableFilterTypes"
                    :key="filterType"
                    :value="filterType"
                >
                    {{ filterType }}
                </option>
            </select>
        </label>
    </div>
</template>

<script>
    import {getFiltersForColumnType, createFilter} from './index'

    export default {
        name: "AddFilterBlock",
        data() {
            const selectedColumn = Object.keys(this.columns)[0];
            const availableFilters = getFiltersForColumnType(this.columns[selectedColumn].type || "text");

            return {
                selectedColumn,
                selectedFilterType: availableFilters[0]
            }
        },
        props: {
            columns: Object,
            filters: Object
        },
        computed: {
            unfilteredColumns() {
                return Object.keys(this.columns).filter(
                    columnName => this.filters.getAvailableFiltersForColumn(columnName).length
                );
            },
            availableFilterTypes() {
                return this.filters.getAvailableFiltersForColumn(this.selectedColumn)
            }
        },
        methods: {
            addFilter() {
                const newFilter = createFilter(this.selectedFilterType);
                this.$emit("filter-added", this.selectedColumn, this.selectedFilterType, newFilter);
            },
            updateSelectedFilterType() {
                this.selectedFilterType = this.availableFilterTypes[0]
            }
        },
        watch: {
            selectedColumn() {
                this.updateSelectedFilterType();
            },
            filters() {
                this.selectedColumn = this.unfilteredColumns[0];
                this.updateSelectedFilterType();
            }
        }
    }
</script>

<style lang="less" src="../../styles/filter-panel.less"></style>