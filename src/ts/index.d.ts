declare namespace DPlayerTypes {
    // TODO use this!

    // TODO remove generic indexable Type!!
    // ATTENTION use with cause, since we can't use every string to to that!
    interface StringIndexableObject {
        [index: string]: unknown;
    }
}

declare module '*.svg' {
    const content: string;
    export default content;
}
