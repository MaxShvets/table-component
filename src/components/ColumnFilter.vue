<template>
    <label class="filter-block">
        {{ filteredColumnTitle }} contains
        <input type="text" @input="$emit('input', $event.target.value)">
        <button class="remove-filter" @click="$emit('remove-filter')">
            &#x2715;
        </button>
    </label>
</template>

<script>
    export default {
        name: "ColumnFilter",
        props: {
            filteredColumnTitle: {
                type: String,
                required: true
            }
        }
    }
</script>

<style lang="less" src="../styles/filter-panel.less"></style>