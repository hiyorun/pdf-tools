export type Image = {
    id: string;
    el: HTMLImageElement;
    name: string;
    date: number;
    selected: boolean;
};

export type ProcessInfo = {
    id: string;
    progress: number;
    state: status;
    filename: string;
}

export enum status {
    Success,
    Error,
    Aborted,
    Pending
}