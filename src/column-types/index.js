export const columnTypes = Object.freeze({
    text: "text",
    number: "number"
});

export function validateInputType(value) {
    return value in columnTypes;
}

