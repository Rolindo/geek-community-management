import Bmob from "hydrogen-js-sdk";
// 使用Promise封装添加场地的请求
export function addPlace(placeName) {
    return new Promise((resolve, reject) => {
        const setPlace = Bmob.Query("Place");
        setPlace.set("placeName", placeName);
        setPlace.set("occupied", false);
        setPlace.save().then(saveResult => {
            resolve(true)
        }).catch(err => {
            reject(false)
        })
    })
}
// 使用Promise封装修改场地信息的请求
export function editPlace(placeName, placeId) {
    return new Promise((resolve, reject) => {
        Bmob.Query("Place").get(placeId).then(editPlace => {
            editPlace.set("placeName", placeName);
            editPlace.save().then(success => {
                Bmob.Query("Activity").get(editPlace.activityId).then(updatePlace => {
                    updatePlace.set("placeName", placeName);
                    updatePlace.save().then(success => {
                        resolve(true);
                    })
                })
            }).catch(err => {
                reject(false);
            })
        }).catch(err => {
            reject(false);
        })
    })
}