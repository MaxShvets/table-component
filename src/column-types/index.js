export const columnTypes = Object.freeze({
    text: "text",
    number: "number"
});

export function validateInputType(value) {
    return value in columnTypes;
}

export function normalizeColumns(columns) {
    return Object.entries(columns).reduce((columns, [columnName, columnData]) => {
        columns[columnName] = typeof columnData === "string"
            ? {
                title: columnData,
                type: "text"
            }
            : columnData;
            return columns;
    }, {});
}

