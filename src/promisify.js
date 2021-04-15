function promisify(query) {
    return new Promise((resolve, reject) => {
        query.exec((err, data) => {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
}
export { promisify };
//# sourceMappingURL=promisify.js.map