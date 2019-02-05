<template>
    <td @click="$emit('click')">
        <input
            v-if="value !== undefined || isCurrentlyEdited"
            :type="isValueNumeric ? 'number' : 'text'"
            :value="value"
            @change="$emit('change', $event)"
            @focusout="$emit('focusout')"
            v-focus="isCurrentlyEdited"
        >
        <span v-else class="missing-value">unknown</span>
    </td>
</template>

<script>
    export default {
        name: "TableCell",
        props: {
            value: [Number, String],
            isValueNumeric: Boolean,
            isCurrentlyEdited: Boolean
        },
        directives: {
            focus: {
                inserted(el, binding) {
                    binding.value && el.focus();
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    td input, .missing-value {
        padding: 0 0 0 2px;
    }

    td input {
        width: 100%;
        border: none;
        box-sizing: border-box;
        height: 25px;
    }

    .missing-value {
        font-size: 11px;
    }
</style>