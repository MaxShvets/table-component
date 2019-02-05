export function basicComparator(value, otherValue) {
    if (value === undefined && otherValue !== undefined) {
        return 1;
    } else if (otherValue === undefined && value !== undefined) {
        return -1;
    } else if (otherValue < value) {
        return 1;
    } else if (value < otherValue) {
        return -1;
    } else {
        return 0;
    }
}