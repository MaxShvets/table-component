<template>
    <label class="filter-block">
        <slot></slot>
        <button class="remove-filter" @click="$emit('remove-filter')">
            &#x2715;
        </button>
    </label>
</template>

<script>
    export default {
        name: "FilterContainer"
    }
</script>

<style lang="less" src="../../styles/filter-panel.less"></style>