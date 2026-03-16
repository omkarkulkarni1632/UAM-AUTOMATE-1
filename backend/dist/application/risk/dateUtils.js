"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.differenceInDays = differenceInDays;
function differenceInDays(a, b) {
    const ms = a.getTime() - b.getTime();
    return Math.floor(ms / (1000 * 60 * 60 * 24));
}
