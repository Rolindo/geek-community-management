import Bmob from "hydrogen-js-sdk";
import CryptoJS from 'crypto-js'
// 使用Promise封装获取表格数据的请求
export function getTableData(tableName) {
    return new Promise((resolve, reject) => {
        Bmob.Query(tableName).find().then(res => {
            resolve(res);
        }).catch(err => {
            reject(err);
        })
    })
}
// 使用Promise封装获取字段的请求
export function getItem(tableName, objectId) {
    return new Promise((resolve, reject) => {
        // 根据传入的表名和ObjectId获取对象数据
        Bmob.Query(tableName).get(objectId).then(res => {
            resolve(res);
        }).catch(err => {
            reject(err);
        })
    })
}
// 使用Promise封装删除字段的请求
export function deleteItem(tableName, objectId) {
    return new Promise((resolve, reject) => {
        // 根据传入的表名和ObjectId删除对象
        Bmob.Query(tableName).destroy(objectId).then(res => {
            resolve(true);
        }).catch(err => {
            reject(err);
        })
    })
}
// 使用Promise封装更新字段的请求
export function updateItem(tableName, editForm, updateUserobjectId, reLoginCode, currentUserName) {
    return new Promise((resolve, reject) => {
        Bmob.Query(tableName).get(updateUserobjectId).then(res => {
            // 遍历传入的对象
            for (const key in editForm) {
                res.set(key + "", editForm[key]);
            }
            res.save().then(res => {
                // 退出当前修改用户的登录
                Bmob.User.logout();
                // 解密
                const bytes = CryptoJS.AES.decrypt(reLoginCode, "secret key");
                const originalText = bytes.toString(CryptoJS.enc.Utf8);
                // 重新登录用户
                Bmob.User.login(currentUserName, originalText).then(res => {
                    resolve(true);
                }).catch(err => {
                    reject(false);
                })

            })
        })
    })
}