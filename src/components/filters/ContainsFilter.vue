<template>
    <FilterContainer v-on="$listeners">
        {{ columnTitle }} contains
        <input
            class="underlined-input"
            type="text"
            :value="value"
            @input="$emit('input', {value: $event.target.value})">
    </FilterContainer>
</template>

<script>
    import FilterContainer from './FilterContainer';

    export default {
        name: "ContainsFilter",
        props: {
            columnTitle: {
                type: String,
                required: true
            },
            value: String
        },
        components: {
            FilterContainer
        }
    }
</script>