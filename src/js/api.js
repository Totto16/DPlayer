import axios from 'axios';

export default {
    send: (options) => {
        axios
            .post(options.url, options.data)
            .then((response) => {
                const data = response.data;
                if (!data || data.code !== 0) {
                    options.error && options.error(data && data.msg);
                    return;
                }
                options.success && options.success(data);
            })
            .catch((e) => {
                console.error(e);
                options.error && options.error();
            });
    },

    read: (options) => {
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

    async backend(options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            options.json = options.json || true;
            options.query = options.query || {};
            options.method = options.method || 'GET';
            if (options.url) {
                axios({
                    method: options.method.toLowerCase(),
                    url: options.url,
                    params: options.query,
                })
                    .then((response) => {
                        if (!response.data) {
                            throw new Error('No data in the Response!');
                        }

                        if (response.data.error === false) {
                            if (response.data.type === 'reference') {
                                resolve(response.data.data);
                            } else {
                                // TODO handle raw data!
                                throw new Error("Couldn't handle raw data at the moment!");
                            }
                        } else {
                            switch (response.data['error-type']) {
                                case 'notice':
                                    resolve(); // resolve with undefined
                                    break;
                                case 'warning':
                                    resolve(); // resolve with undefined
                                    break;
                                case 'error':
                                    throw new Error(`[ERROR] Error message from API: ${response.data['error-message']}`);
                                case 'severe':
                                    throw new Error(`[SEVERE] Error message from API: ${response.data['error-message']}`);
                                default:
                                    throw new Error(`Unknown Error message from API: ${response.data['error-message']}`);
                            }
                        }
                    })
                    .catch(reject);
            } else {
                reject('No URL provided');
            }
        });
    },
};
