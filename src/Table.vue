<template>
    <table>
        <tr>
            <th v-for="(titleText, titleKey) in data.titles" :key="titleKey">
                {{ titleText }}
            </th>
        </tr>
        <tr v-for="item in data.items" :key="item.name">
            <td v-for="(_, propertyName) in data.titles" :key="propertyName">
                {{ item[propertyName] }}
            </td>
        </tr>
    </table>
</template>

<script>
export default {
    name: 'Table',
    props: ['data']
}
</script>

<style scoped>
    table {
        border-collapse: collapse;
    }

    td, th {
        border: 1px solid #000;
    }
</style>
