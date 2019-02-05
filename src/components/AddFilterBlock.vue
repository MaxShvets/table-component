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
    </div>
</template>

<script>
    export default {
        name: "AddFilterBlock",
        data() {
            return {
                selectedColumn: Object.keys(this.columns)[0]
            }
        },
        props: {
            columns: Object,
            filters: Object
        },
        computed: {
            unfilteredColumns() {
                return Object.keys(this.columns).filter(columnName => !(columnName in this.filters));
            }
        },
        methods: {
            addFilter() {
                this.$emit("filter-added", this.selectedColumn);
                this.selectedColumn = this.unfilteredColumns[0];
            }
        }
    }
</script>

<style lang="less" src="../styles/filter-panel.less"></style>