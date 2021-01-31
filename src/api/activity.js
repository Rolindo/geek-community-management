import Bmob from "hydrogen-js-sdk";
// 引入moment日期处理类库
import moment from "moment";
import {
    deleteItem
} from './common'
import {
    getItem
} from './common'
// 使用Promise封装获取表格数据的请求
export function createActivity(activityData) {
    return new Promise(async (resolve, reject) => {
        // 获取活动名称及活动时间
        const {
            activityName,
            time
        } = activityData;
        // 转换2021年1月18日16:28:23
        for (let i = 0; i < time.length; i++) {
            time[i] = moment(time[i]).format("YYYY年MM月DD日")
        }
        // 获取活动地点ID
        const placeId = activityData.placeData.objectId;
        // 获取社团ID
        const societyId = activityData.societyData.objectId;
        // 获取地点名称
        const {
            placeName
        } = activityData.placeData;
        // 获取社团名称
        const {
            societyName
        } = activityData.societyData;
        // 获取社团活动数组
        const {
            activitiesId
        } = await getItem("Society", societyId);
        const createActivity = Bmob.Query("Activity");
        createActivity.set("activityName", activityName);
        createActivity.set("placeName", placeName);
        createActivity.set("societyName", societyName);
        createActivity.set("societyId", societyId);
        createActivity.set("placeId", placeId);
        createActivity.set("numberOfActivities", 0);
        createActivity.set("startTime", time[0]);
        createActivity.set("endTime", time[1]);
        createActivity.save().then(createActivitySuccess => {
            Bmob.Query("Place").get(placeId).then(setPlace => {
                setPlace.set("activityId", createActivitySuccess.objectId);
                setPlace.set("occupied", true);
                setPlace.save().then(success => {
                    Bmob.Query("Society").get(societyId).then(setSocietyActivity => {
                        let arr = [];
                        if (!activitiesId) {
                            arr.push(createActivitySuccess.objectId);
                        } else {
                            activitiesId.push(createActivitySuccess.objectId);
                            arr = activitiesId;
                        }
                        setSocietyActivity.set("activitiesId", arr);
                        setSocietyActivity.save().then(setSocietyActivityRes => {
                            resolve(true);
                        }).catch(err => {
                            reject(false);
                        })
                    })
                });
            })
        }).catch(err => {
            reject(false);
        })
    })
}
// 使用Promise封装删除活动的请求
export function deleteActivity(activityData) {
    return new Promise(async (resolve, reject) => {
        const {
            objectId,
            placeId,
            societyId
        } = activityData;
        // 删除活动
        const deleteActivityResult = await deleteItem("Activity", objectId);
        if (deleteActivityResult) {
            // 删除place表中的
            Bmob.Query("Place").get(placeId).then(editPlace => {
                editPlace.set("activityId", "");
                editPlace.set("occupied", false);
                editPlace.save().then(editPlaceSuccess => {
                    Bmob.Query("Society").get(societyId).then(editSociety => {
                        editSociety.set("activitiesId", []);
                        editSociety.save().then(editSocietySuccess => {
                            resolve(true);
                        })
                    })
                })
            }).catch(err => {
                reject(false);
            })
        }
    })
}
// 使用Promise封装更新活动的请求
export function updateActivity(activityData) {
    return new Promise(async (resolve, reject) => {
        const {
            societyData,
            placeData,
            activityName,
            objectId
        } = activityData;
        // 地址名称
        const placeName = placeData ? placeData.placeName : "";
        // 旧地址ID
        const oldplaceId = activityData.placeId;
        // 新地址ID
        const newPlaceId = placeData ? placeData.objectId : "";
        // 社团名称
        const societyName = societyData ? societyData.societyName : "";
        const societyId = societyData ? societyData.objectId : "";
        // 社团ID
        // 修改Activity表中的内容
        Bmob.Query("Activity").get(activityData.objectId).then(updateActivity => {
            if (activityData.time) {
                // 转换时间
                for (let i = 0; i < activityData.time.length; i++) {
                    activityData.time[i] = moment(activityData.time[i]).format("YYYY年MM月DD日")
                }
                // 设置开始时间与结束时间
                updateActivity.set("startTime", activityData.time[0]);
                updateActivity.set("endTime", activityData.time[1]);
            }
            if (placeName) {
                // 设置活动地点名称
                updateActivity.set("placeName", placeName);
                // 设置地点ID
                updateActivity.set("placeId", newPlaceId);
            }
            // 设置活动名称
            updateActivity.set("activityName", activityName);
            if (societyName) {
                // 设置社团名称                                        
                updateActivity.set("societyName", societyName);
            }
            if (societyId) {
                // 设置社团ID
                updateActivity.set("societyId", societyId);
            }
            updateActivity.save().then(editSuccess => {
                if (placeData) {
                    // 获取旧placeID
                    Bmob.Query("Place").get(oldplaceId).then(updatePlace => {
                        updatePlace.set("occupied", false);
                        updatePlace.set("activityId", "");
                        updatePlace.save().then(updatePlaceSuccess => {
                            Bmob.Query("Place").get(newPlaceId).then(updateNewPlace => {
                                updateNewPlace.set("occupied", true);
                                updateNewPlace.set("activityId", activityData.objectId);
                                updateNewPlace.save().then(editSuccess => {});
                            })
                        })
                    })
                }
                if (societyData) {
                    // 修改社团
                    Bmob.Query("Society").get(societyId).then(editSociety => {
                        // resolve(editSociety.activitiesId);
                        const activitiesId = editSociety.activitiesId || [];
                        activitiesId.push(objectId);
                        editSociety.set("activitiesId", activitiesId);
                        editSociety.save().then( // 将原先社团中activitiesId对应项删除
                            Bmob.Query("Society").get(activityData.societyId).then(editPreSociety => {
                                let arr = [];
                                // 遍历社团表中的活动ID，当发现存在一样的删除
                                for (let i = 0; i < editPreSociety.activitiesId.length; i++) {
                                    if (editPreSociety.activitiesId[i] === activityData.objectId) {
                                        continue;
                                    }
                                    arr.push(editPreSociety.activitiesId[i]);
                                }
                                editPreSociety.set("activitiesId", arr);
                                editPreSociety.save().then(editPreSociety => {});
                            }).catch(err => {
                                reject(false)
                            }))
                    })
                }
                resolve(editSuccess);
            });
        })
    })
}