import axios, { AxiosResponse, Method } from 'axios';

const API: DPlayerAPI = {
    send: (options: DPlayerDanmakuOptions): void => {
        axios
            .post(options.url, options.data)
            .then((response: AxiosResponse<StringIndexableObject, string>) => {
                const data = response.data;
                if (data.code !== 0) {
                    if (typeof options.error === 'function') {
                        options.error(new Error(typeof data.msg === 'string' ? data.msg : 'ERROR, no Error Message Present!!'));
                    }
                    return;
                }
                if (typeof options.success === 'function') {
                    options.success(data);
                }
            })
            .catch((e) => {
                console.error(e);
                options.error && options.error(e);
            });
    },

    read: (options: DPlayerDanmakuOptions): void => {
        axios
            .get(options.url)
            .then((response) => {
                const data = response.data;
                if (!data || data.code !== 0) {
                    options.error && options.error(data && data.msg);
                    return;
                }
                options.success &&
                    options.success(
                        data.data.map((item) => ({
                            time: item[0],
                            type: item[1],
                            color: item[2],
                            author: item[3],
                            text: item[4],
                        }))
                    );
            })
            .catch((e) => {
                console.error(e);
                options.error && options.error();
            });
    },

    async backend(options?: DPlayerBackendOptions): Promise<DPlayerBackendResponse | null> {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.json = options.json ?? true;
            options.query = options.query || {};
            options.method = options.method || 'GET';
            if (options.url !== undefined) {
                axios({
                    method: options.method,
                    url: options.url,
                    params: options.query,
                })
                    .then((response: AxiosResponse<StringIndexableObject, string>) => {
                        if (typeof response.data === 'undefined') {
                            throw new Error('No data in the Response!');
                        }

                        if (response.data.error === false) {
                            if (response.data.type === 'reference') {
                                // TODO 'as' is dangerous, check that manually!
                                resolve(typeof response.data.data !== 'undefined' ? (response.data.data as DPlayerBackendResponse) : null);
                            } else {
                                // TODO handle raw data!
                                throw new Error("Couldn't handle raw data at the moment!");
                            }
                        } else {
                            const errorMsg: string =
                                typeof response.data['error-message'] !== 'undefined' ? (response.data['error-message'] === 'string' ? response.data['error-message'] : 'Error in parsinf Error Message') : 'Error in parsinf Error Message';

                            switch (response.data['error-type']) {
                                case 'notice':
                                    resolve(null); // resolve with null
                                    break;
                                case 'warning':
                                    resolve(null); // resolve with null
                                    break;
                                case 'error':
                                    throw new Error(`[ERROR] Error message from API: ${errorMsg}`);
                                case 'severe':
                                    throw new Error(`[SEVERE] Error message from API: ${errorMsg}`);
                                default:
                                    throw new Error(`Unknown Error message from API: ${errorMsg}`);
                            }
                        }
                    })
                    .catch((err: Error) => reject(err));
            } else {
                reject(new Error('No URL provided'));
            }
        });
    },
};

export default API;

export interface DPlayerDanmakuOptions {
    url: string;
    data: StringIndexableObject;
    success?: (response: DPlayerDanmakuResponse) => void;
    error?: (error: Error) => void;
}

export interface DPlayerBackendOptions {
    json?: boolean;
    method?: Method;
    url?: string;
    query?: StringIndexableObject;
}

export type DPlayerBackendResponse = string; // for the moment!

export type DPlayerDanmakuResponse = {
    time: string;
    type: string;
    color: string;
    author: string;
    text: string;
};

// TODO remove generic indexable Type!!
// ATTENTION use with cause, since we can't use every string to to that!
export interface StringIndexableObject {
    [index: string]: unknown;
}

export interface DPlayerAPI {
    send: (options: DPlayerDanmakuOptions) => void;
    read: (options: DPlayerDanmakuOptions) => void;
    backend: (options?: DPlayerBackendOptions) => Promise<DPlayerBackendResponse | null>;
}
