<template>
    <th
        @click="$emit('click')"
        v-bind:class="{'sorted-column': sorted, ascending: ascending}"
    >
        <span>{{ title }}</span>
    </th>
</template>

<script>
    export default {
        name: "TableHeading",
        props: {
            sorted: Boolean,
            ascending: Boolean,
            title: String
        }
    }
</script>

<style lang="less" scoped>
    th {
        background-color: #b0e2ff;
        font-weight: 500;
        font-size: 14px;
        cursor: pointer;
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