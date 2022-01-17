import axios, { AxiosResponse, Method } from 'axios';
import { isOfType, StringIndexableObject } from '.';

const API: DPlayerAPI = {
    send: (options: DPlayerDanmakuSendOptions): void => {
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
                    if (typeof data === 'string') {
                        options.success(data);
                    } else {
                        options.error?.(new Error('Returned data from API was empty!')) ?? console.warn('Error in DanmakuRequest without error handler!');
                    }
                }
            })
            .catch((e: Error) => {
                console.error(e);
                if (typeof options.error === 'function') {
                    options.error(e);
                }
            });
    },

    read: (options: DPlayerDanmakuReadOptions): void => {
        axios
            .get(options.url)
            .then((response: AxiosResponse<StringIndexableObject, string>) => {
                const data = response.data;
                if (!data || data.code !== 0) {
                    if (typeof options.error === 'function') {
                        options.error(new Error(typeof data.msg === 'string' ? data.msg : 'ERROR, no Error Message Present!!'));
                    }
                    return;
                }
                if (typeof options.success === 'function') {
                    const responseData: DPlayerDanmakuData[] = (data.data as string[][]).map((item: string[]) => ({
                        time: item[0],
                        type: item[1],
                        color: item[2],
                        author: item[3],
                        text: item[4],
                    }));

                    if (isOfType<DPlayerDanmakuData[]>(responseData)) {
                        options.success(responseData);
                    } else {
                        options.error?.(new Error('Returned data from API was not in the right format!')) ?? console.warn('Error in DanmakuRequest without error handler!');
                    }
                }
            })
            .catch((e: Error) => {
                console.error(e);
                if (typeof options.error === 'function') {
                    options.error(e);
                }
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
                                typeof response.data['error-message'] !== 'undefined' ? (response.data['error-message'] === 'string' ? response.data['error-message'] : 'Error in parsing Error Message') : 'Error in parsing Error Message';

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

export interface DPlayerDanmakuSendOptions {
    url: string;
    data: DPlayerDanmakuData;
    success?: (response: DPlayerBackendResponse) => void;
    error?: (error: Error) => void;
}

export interface DPlayerDanmakuReadOptions {
    url: string;
    data: StringIndexableObject;
    success?: (response: DPlayerDanmakuData[]) => void;
    error?: (error: Error) => void;
}

export interface DPlayerBackendOptions {
    json?: boolean;
    method?: Method;
    url?: string;
    query?: StringIndexableObject;
}

export type DPlayerBackendResponse = string; // for the moment!

export type DPlayerDanmakuData = {
    time: string;
    type: string;
    color: string;
    author: string;
    text: string;
};

export interface DPlayerAPI {
    send: (options: DPlayerDanmakuSendOptions) => void;
    read: (options: DPlayerDanmakuReadOptions) => void;
    backend: (options?: DPlayerBackendOptions) => Promise<DPlayerBackendResponse | null>;
}
