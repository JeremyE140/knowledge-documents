// Useful functions
export const transformStrToArray = (str) => str.split(',').map(k => k.trim()).filter(k => k !== "");
export const areArraysIdentical = (arr1, arr2) =>
    arr1.length === arr2.length && arr1.slice().sort().every((val, index) =>
        val === arr2.slice().sort()[index]);