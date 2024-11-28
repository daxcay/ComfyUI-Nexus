export class UserManager {
    constructor() {
        this.users = {}
    }

    create(id) {
        if (!this.users[id]) {
            this.users[id] = {}
        }
    }

    set(id, key, data) {
        this.create(id)
        this.users[id][key] = data
    }

    get(id, key) {
        this.create(id)
        return this.users[id][key]
    }

    remove(id) {
        if(this.users[id])
            delete this.users[id];
        return true
    }
}
