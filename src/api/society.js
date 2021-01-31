import Bmob from "hydrogen-js-sdk";
import CryptoJS from 'crypto-js'
import {
    deleteItem
} from './common'
// 使用Promise封装重新登录的请求
export function reLogin(reLoginCode, currentUserName) {
    return new Promise((resolve, reject) => {
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
}
// 使用promise封装添加社团请求
export function createSociety(societyData, reLoginCode, currentUserName) {
    return new Promise((resolve, reject) => {
        const {
            societyName,
            numberOfSociety,
            proprieterData
        } = societyData;
        // 获取社长的用户名及社长的ID
        const {
            username,
            objectId,
        } = proprieterData;
        // 在Society表中创建相应条目
        const setSociety = Bmob.Query("Society");
        setSociety.set("societyName", societyName);
        setSociety.set("numberOfSociety", numberOfSociety);
        setSociety.set("proprieterName", username);
        setSociety.set("proprieterId", objectId);
        setSociety.set("activitiesId", []);
        setSociety.save().then(res => {
            // 创建成功
            if (res.objectId) {
                // 修改User表的用户身份
                Bmob.Query("_User").get(objectId).then(setSocietyId => {
                    setSocietyId.set("societyId", res.objectId);
                    setSocietyId.set("identity", "社长");
                    setSocietyId.save().then(success => {
                        const reLoginRes = reLogin(reLoginCode, currentUserName);
                        if (reLoginRes) {
                            resolve(true);
                        }
                    }).catch(err => {
                        reject(err)
                    })
                })
            }
        }).catch(err => {
            reject(err)
        })
    })
}
// 使用promise封装获取社团列表请求
export function getSocietyList() {
    return new Promise(async (resolve, reject) => {
        const societyQuery = Bmob.Query('Society');
        societyQuery.find().then(res => {
            resolve(res)
        }).catch(err => {
            reject(err)
        })
    })
}
// 使用promise封装删除社团的请求(先删除社团再修改用户表中的用户数据)
export function deleteSociety(tableName, objectId, proprieterId, reLoginCode, currentUserName) {
    return new Promise(async (resolve, reject) => {
        // 修改User表的用户身份
        Bmob.Query("_User").get(proprieterId).then(setSocietyId => {
            setSocietyId.set("identity", "游客");
            setSocietyId.set("societyId", "");
            setSocietyId.save().then(async () => {
                const isDelete = await deleteItem(tableName, objectId);
                if (isDelete) {
                    const reLoginRes = reLogin(reLoginCode, currentUserName);
                    if (reLoginRes) {
                        resolve(true)
                    }
                }
            }).catch(err => {
                reject(err)
            })
        })
    })
}

// 使用promise封装修改社团的请求
export function editSociety(objectId, proprieterId, proprieterName, societyName, preProprieterId, reLoginCode, currentUserName) {
    return new Promise(async (resolve, reject) => {
        // const societyQuery = Bmob.Query('Society');
        // societyQuery.equalTo("proprieterName", "==", proprieterName);
        // Bmob.Query("Society")
        // 修改User表的用户身份
        Bmob.Query("Society").get(objectId).then(editSocietyRes => {
            editSocietyRes.set("societyName", societyName);
            editSocietyRes.set("proprieterId", proprieterId);
            editSocietyRes.set("proprieterName", proprieterName);
            editSocietyRes.save().then(async () => {
                Bmob.Query("_User").get(proprieterId).then(editUser => {
                    editUser.set("societyId", objectId);
                    editUser.set("identity", "社长");
                    editUser.save().then(async () => {
                        Bmob.Query("_User").get(preProprieterId).then(editPreProprieter => {
                            editPreProprieter.set("societyId", "");
                            editPreProprieter.set("identity", "社员");
                            editPreProprieter.save().then(async () => {
                                const reLoginRes = reLogin(reLoginCode, currentUserName);
                                if (reLoginRes) {
                                    resolve(true)
                                }
                            })
                        })

                    })
                });
            }).catch(err => {
                reject(err)
            })
        })
    })
}