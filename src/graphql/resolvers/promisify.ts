function promisify<T>(query): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        query.exec((err, data: T) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}
  
export {promisify};