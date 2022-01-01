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
            // TODO request APi version, Available endpoints and some config!!
            // TODO define standard API behavior!!
            options = options || {};
            options.json = options.json || true;
            options.query = options.query || [];
            options.method = options.method || 'GET';
            if (options.url) {
                axios
                    .get(options.url, {})
                    .then((response) => {
                        // check if status is ok, if response is valid json, and if version match, then control the API specs, like
                        // version etc..., then get the data en resolve that!
                        resolve(response.data);
                    })
                    .catch(reject);
            } else {
                reject('No URL provided');
            }
        });
    },
};
