const fetch = require('node-fetch');

const APP = 'http://reconengine.herokuapp.com';

class ReconClient {

    constructor(options, callback) {
        if(!options.token)
            throw new Error('token not specified!');
        fetch(`${APP}/api/v1/app/${options.token}`)
            .then(res => res.json())
            .then(json => {
                if(json.error)
                    throw new Error('There was an error loading your app. The app might not exist!');
                this.token = options.token;
                this.connected = true;
                console.log('🍭 Successfully connected...');
                if(callback)
                    callback(this.token);
            })
            .catch(err => {
                console.log(err);
                throw new Error('There was an error loading your app. The app might not exist!');
            })
    }

    async userMultipleActions(userID, itemlist) {
        const params = new URLSearchParams({ userID, itemlist })
        const res = await fetch(`${APP}/api/v1/items/${this.token}?${params}`, { method: 'POST' })
        return await res.json();
    }

    async userAction(userID, item) {
        const params = new URLSearchParams({ userID: userID, itemlist: [item] })
        const res = await fetch(`${APP}/api/v1/items/${this.token}?${params}`, { method: 'POST' });
        return await res.json();
    }

    async trainModel() {
        let ret = await fetch(`${APP}/api/v1/models/train/${this.token}`, { method: 'POST' });
        return await ret.json();
    }

    async recommend(userID) {
        let ret = await fetch(`${APP}/api/v1/models/recommend/${this.token}/${userID}`);
        let json = await ret.json();
        if(json.error)
            throw new Error(json.error);
        return json.recommendations;
    }

    recommendAnonymously(item_list, callback) {
        let userID = `anonymous_${uuid(20)}`
        this.userMultipleActions(userID, item_list).then(res => {
            this.recommend(userID).then(res => callback(res))
        }).catch(err => {
            if(err) throw err;
        })
    }

}

function uuid(length) {
    let ret = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
    for(let i = 0; i < length; i++) {
        ret += chars[Math.floor(Math.random() * (chars.length-1))];
    }   
    return ret;
}

module.exports = ReconClient;