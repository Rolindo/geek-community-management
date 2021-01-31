import Bmob from "hydrogen-js-sdk";
// 使用promise封装用户注册请求
export function register(params) {
    return new Promise((resolve, reject) => {
        Bmob.User.register(params).then(regsiterRes => {
            resolve(regsiterRes);
        }).catch(err => {
            // 根据错误代码向前端返回错误信息
            switch (err.code) {
                case 202:
                    reject("用户名已存在");
                    break;
                case 301:
                    reject("手机号码必须是11位的数字");
                    break;
                case 209:
                    reject("该手机号码已存在");
                    break;
                default:
                    reject("发生异常错误");
                    break;
            }
        })
    })
}
// 使用promise封装用户登录请求
export function login(params) {
    return new Promise((resolve, reject) => {
        Bmob.User.login(params.username, params.password).then(res => {
            resolve(res)
        }).catch(err => {
            // 根据错误代码向前端返回错误信息
            switch (err.code) {
                case 101:
                    reject("用户名或密码不正确");
                    break;
                default:
                    reject("发生异常错误");
                    break;
            }
        });
    })
}
// 使用promise封装获取用户信息请求
export function getCurrentUser() {
    return new Promise((resolve, reject) => {
        resolve(Bmob.User.current())
    })
}

// 使用promise封装获取用户数据请求
export function getUserList(identity, ...values) {
    return new Promise(async (resolve, reject) => {
        const userQuery = Bmob.Query('_User');
        // 判断用户身份
        if ((identity === "管理员" && values.length === 0) || values[1]) {
            userQuery.equalTo("identity", "!=", "管理员");
            userQuery.find().then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        } else if (identity === "管理员" && values[0] === "member") {
            userQuery.equalTo("identity", "==", "游客");
            userQuery.find().then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        } else {
            userQuery.find().then(res => {
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        }
    })
}