<template>
    <FilterContainer v-on="$listeners">
        {{ columnTitle }} in range
        <label v-for="(value, key) in {from, to}" :key="key">
            {{ key }}
            <input type="number" :value="value" @input="handleRangeChange(key, $event)">
        </label>
    </FilterContainer>
</template>

<script>
    import FilterContainer from './FilterContainer';

    export default {
        name: "RangeFilter",
        props: {
            columnTitle: String,
            from: Number,
            to: Number
        },
        methods: {
            handleRangeChange(rangeEndKey, $event) {
                const range = {from: this.from, to: this.to};
                this.$emit("input", {
                    ...range, [rangeEndKey]: parseFloat($event.target.value)
                })
            }
        },
        components: {
            FilterContainer
        },
    }
</script>