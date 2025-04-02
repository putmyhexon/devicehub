/**
 * Copyright © 2024 contains code contributed by V Kontakte LLC, authors: Daniil Smirnov, Egor Platonov, Aleksey Chistov - Licensed under the Apache license 2.0
 **/

import _ from 'lodash'
import * as dbapi from '../../../db/api.js'
import * as apiutil from '../../../util/apiutil.js'
import logger from '../../../util/logger.js'
import * as lockutil from '../../../util/lockutil.js'
import util from 'util'
import {v4 as uuidv4} from 'uuid'
import usersapi from './users.js'
const log = logger.createLogger('groups-controller:')

/* ---------------------------------- PRIVATE FUNCTIONS --------------------------------- */
async function groupApiWrapper(email, fn, req, res) {
    try {
        const user = await dbapi.loadUser(email)
        if (!user) {
            apiutil.respond(res, 404, 'Not Found (user)')
            return
        }

        req.user = user
        fn(req, res)
    }
    catch (err) {
        apiutil.internalError(res, 'Failed to wrap "%s": ', fn.name, err.stack)
    }
}

async function getDevice(req, serial) {
    const device = await dbapi.loadDeviceBySerial(serial)
    if (!device) {
        throw new Error(`Device not found in devices: ${serial}`)
    }

    return apiutil.filterDevice(req, device)
}

async function checkConflicts(id, devices, dates) {
    const liteGroup = {id: id, devices: devices, dates: dates}
    const conflicts = []

    const groups = await dbapi.getTransientGroups() || []
    for (const otherGroup of groups) {
        if (otherGroup.id === liteGroup.id) {
            continue
        }

        const devices = _.intersection(liteGroup.devices, otherGroup.devices)
        if (!devices?.length) {
            continue
        }

        for (let liteGroupDate of liteGroup.dates) {
            for (let otherGroupDate of otherGroup.dates) {
                if (
                    liteGroupDate.start < otherGroupDate.stop &&
                    liteGroupDate.stop > otherGroupDate.start
                ) {
                    conflicts.push({
                        devices: devices
                        , date: {
                            start: new Date(Math.max(liteGroupDate.start.getTime(), otherGroupDate.start.getTime()))
                            , stop: new Date(Math.min(liteGroupDate.stop.getTime(), otherGroupDate.stop.getTime()))
                        }
                        , group: otherGroup.name
                        , owner: otherGroup.owner
                    })
                }
            }
        }
    }

    return conflicts
}

async function checkSchedule(res, oldGroup, _class, email, repetitions, privilege, start, stop) {
    if (oldGroup?.devices?.length &&
        (apiutil.isOriginGroup(_class) && !apiutil.isOriginGroup(oldGroup.class) ||
            apiutil.isOriginGroup(oldGroup.class) && !apiutil.isOriginGroup(_class))) {
        return await apiutil.respond(res, 403, 'Forbidden (unauthorized class while device list is not empty)')
    }
    if (apiutil.isAdminGroup(_class) && privilege === apiutil.USER) {
        return await apiutil.respond(res, 403, 'Forbidden (unauthorized class)')
    }
    if (isNaN(start.getTime())) {
        return await apiutil.respond(res, 400, 'Bad Request (Invalid startTime format)')
    }
    if (isNaN(stop.getTime())) {
        return await apiutil.respond(res, 400, 'Bad Request (Invalid stopTime format)')
    }
    if (start >= stop) {
        return await apiutil.respond(res, 400, 'Bad Request (Invalid life time: startTime >= stopTime)')
    }
    if ((stop - start) > apiutil.CLASS_DURATION[_class]) {
        return await apiutil.respond(res, 400, 'Bad Request (Invalid Life time & class combination: life time > class duration)')
    }

    if ((_class === apiutil.ONCE && repetitions !== 0) || (_class !== apiutil.ONCE && repetitions === 0)) {
        return await apiutil.respond(res, 400, 'Bad Request (Invalid class & repetitions combination)')
    }

    const owner = await dbapi.loadUser(email)
    if (repetitions > owner.groups.quotas.repetitions) {
        return await apiutil.respond(res, 400, 'Bad Request (Invalid repetitions value)')
    }

    return true
}

/* ---------------------------------- PUBLIC FUNCTIONS ------------------------------------- */
async function addGroupDevices(req, res) {
    const abi = apiutil.getBodyParameter(req.body, 'abi')
    const model = apiutil.getBodyParameter(req.body, 'model')
    const version = apiutil.getBodyParameter(req.body, 'version')
    const sdk = apiutil.getBodyParameter(req.body, 'sdk')
    const type = apiutil.getBodyParameter(req.body, 'type')

    const serials = apiutil.getBodyParameter(req.body, 'serials')
    const target = apiutil.getQueryParameter(req.query.redirected) ? 'device' : 'devices'

    let amount = apiutil.getBodyParameter(req.body, 'amount') // todo: QA-9976
    if (amount) {
        amount = Number(amount)
    }

    let needAmount = apiutil.getBodyParameter(req.body, 'needAmount')
    if (needAmount && typeof needAmount === 'string') {
        needAmount = needAmount === 'true'
    }
    else {
        needAmount = false
    }

    let isInternal = apiutil.getBodyParameter(req.body, 'isInternal')
    if (isInternal && typeof isInternal === 'string') {
        isInternal = isInternal === 'true'
    }
    else {
        isInternal = false
    }

    let email = null
    const lock = {}

    const _addGroupDevices = async(lockedGroup, serials) => {
        let group = lockedGroup
        try {
            const autotestsGroup = await dbapi.addGroupDevices(group, serials)
            if (!isInternal) {
                apiutil.respond(res, 200, `Added (group ${target})`, {group: apiutil.publishGroup(autotestsGroup)})
                return
            }
            const devices = await dbapi.loadDevicesBySerials(autotestsGroup.devices)

            apiutil.respond(res, 200, `Added (group ${target})`, {
                group: {id: autotestsGroup.id, devices}
            })
        }
        catch (err) {
            log.error(err)
            const request = {
                body: {ids: group.id}
                , user: req.user
                , query: {redirected: true}
                , options: req.options
            }
            if (err === 'quota is reached') {
                apiutil.respond(res, 403, 'Forbidden (groups duration quota is reached)')
                deleteGroups(request, res)
            }
            else if (Array.isArray(err)) {
                apiutil.respond(res, 409, 'Conflicts Information', {conflicts: err})
                deleteGroups(request, res)
            }
            else if (err !== 'busy') {
                throw err
            }
        }
    }

    let lockingSuccessed
    try {
        lockingSuccessed = await lockutil.lockGroup(req, res, lock)
        if (!lockingSuccessed) {
            return
        }

        let group = lock.group
        if (req.user.privilege === apiutil.ADMIN && req.user.email !== group.owner.email) {
            email = group.owner.email
            return
        }
        if (apiutil.isOriginGroup(group.class)) {
            apiutil.respond(res, 400, 'Bad Request (use admin API for bookable/standard groups)')
            return
        }

        if (typeof serials === 'undefined' && typeof amount === 'undefined') {
            const devices = await dbapi.loadBookableDevices(req.user.groups.subscribed)

            const serials = devices?.flatMap((device) =>
                group.devices.indexOf(device.serial) < 0 ? [device.serial] : []
            ) || []
            await _addGroupDevices(group, serials)
            return
        }

        if (serials) {
            await _addGroupDevices(group, _.difference(_.without(serials.split(','), ''), group.devices))
            return
        }

        if (amount) {
            return dbapi.loadBookableDevicesWithFiltersLock(req.user.groups.subscribed, abi, model, type, sdk, version, function(devices) {
                let serials = []
                if (devices) {
                    serials = devices.map(device => device.serial)
                }
                if ((serials.length > 0 && !needAmount) || (needAmount && serials.length === amount)) {
                    return _addGroupDevices(group, serials)
                }
                else {
                    apiutil.respond(res, 409, 'Cant create group. Not enough free devices')
                    deleteGroups({
                        body: {ids: group.id}
                        , user: req.user
                        , query: {redirected: true}
                        , options: req.options
                    }, res)
                }
            }, amount)
        }
    }
    catch (err) {
        apiutil.internalError(res, `Failed to add group ${target}: `, err.stack)
    }
    finally {
        if (lockingSuccessed) {
            lockutil.unlockGroup(lock)
        }
        if (email) {
            groupApiWrapper(email, addGroupDevices, req, res)
        }
    }
}

function addGroupDevice(req, res) {
    apiutil.redirectApiWrapper('serial', addGroupDevices, req, res)
}

async function removeGroupDevices(req, res) {
    const serials = apiutil.getBodyParameter(req.body, 'serials')
    const target = apiutil.getQueryParameter(req.query.redirected) ? 'device' : 'devices'
    const isInternal = req.isInternal
    const lock = {}
    let lockingSuccessed
    try {
        lockingSuccessed = await lockutil.lockGroup(req, res, lock)
        if (!lockingSuccessed) {
            return
        }

        const group = lock.group
        if (apiutil.isOriginGroup(group.class)) {
            apiutil.respond(res, 400, 'Bad Request (use admin API for bookable/standard groups)')
            return
        }

        let serialsToRemove = group.devices
        if (typeof serials !== 'undefined') {
            serialsToRemove = _.without(serials.split(','), '')
        }

        if (!serialsToRemove.length) {
            apiutil.respond(res, 200, `Unchanged (group ${target})`, {group: {}})
            return
        }

        serialsToRemove = _.intersection(serialsToRemove, group.devices)
        if (!serialsToRemove.length) {
            apiutil.respond(res, 404, `Not Found (group ${target})`)
            return
        }

        const removeGroup = await dbapi.removeGroupDevices(group, serialsToRemove)
        if (removeGroup.class === apiutil.ONCE) {
            await dbapi.returnDevicesToOriginGroup(serialsToRemove)
            if (!isInternal) {
                apiutil.respond(res, 200, `Removed (group ${target})`, {group: apiutil.publishGroup(removeGroup)})
            }
        }
        else {
            apiutil.respond(res, 200, `Removed (group ${target})`, {group: apiutil.publishGroup(removeGroup)})
        }
    }
    catch (err) {
        apiutil.internalError(res, `Failed to remove group ${target}: `, err.stack)
    }
    finally {
        if (lockingSuccessed) {
            lockutil.unlockGroup(lock)
        }
    }
}
function removeGroupDevice(req, res) {
    apiutil.redirectApiWrapper('serial', removeGroupDevices, req, res)
}

async function getGroupDevice(req, res) {
    const id = req.params.id
    const serial = req.params.serial
    try {
        const group = await dbapi.getUserGroup(req.user.email, id)
        if (!group || group?.devices?.indexOf(serial) < 0) {
            apiutil.respond(res, 404, 'Not Found (group)')
        }
        else {
            const device = await getDevice(req, serial)
            apiutil.respond(res, 200, 'Device Information', {device: device})
        }
    }
    catch (err) {
        apiutil.internalError(res, 'Failed to get group device: ', err.stack)
    }
}

async function getGroupUser(req, res) {
    const id = req.params.id
    const email = req.params.email
    try {
        const group = await dbapi.getUserGroup(req.user.email, id)
        if (!group) {
            apiutil.respond(res, 404, 'Not Found (group)')
        }
        else if (group.users.indexOf(email) < 0) {
            apiutil.respond(res, 404, 'Not Found (user)')
        }
        else {
            await usersapi.getUserByEmail(req, res)
        }
    }
    catch (err) {
        apiutil.internalError(res, 'Failed to get group user: ', err.stack)
    }
}

async function getGroupUsers(req, res) {
    try {
        const id = req.params.id
        const group = await dbapi.getUserGroup(req.user.email, id)
        if (!group) {
            apiutil.respond(res, 404, 'Not Found (group)')
        }

        const users = await Promise.all(group.users?.map(async(email) =>
            await usersapi.getUserInfo(req, email) ||
            Promise.reject(`Group user not found: ${email}`)
        ))

        apiutil.respond(res, 200, 'Users Information', {users: users})
    }
    catch (err) {
        apiutil.internalError(res, 'Failed to get group users: ', err.stack)
    }
}

async function removeGroupUsers(req, res) {
    const id = req.params.id
    const emails = apiutil.getBodyParameter(req.body, 'emails')
    const target = apiutil.getQueryParameter(req.query.redirected) ? 'user' : 'users'
    const lock = {}

    const removeGroupUser = async(email, group, rootGroup) => {
        if (group.users.indexOf(email) < 0) {
            return 'not found'
        }
        if (email === rootGroup.owner.email || email === group.owner.email) {
            return 'forbidden'
        }
        const lock = {}
        try {
            const stats = await dbapi.lockUser(email)
            if (stats.modifiedCount === 0) {
                return apiutil.lightComputeStats(res, stats)
            }
            lock.user = stats.changes[0].new_val

            const isAllowed = await dbapi.isRemoveGroupUserAllowed(email, group)
            return isAllowed ? dbapi.removeGroupUser(id, email) : 'forbidden'
        }
        // eslint-disable-next-line no-useless-catch
        catch (err) {
            throw err
        }
        finally {
            lockutil.unlockUser(lock)
        }
    }

    let lockingSuccessed
    try {
        lockingSuccessed = await lockutil.lockGroup(req, res, lock)
        if (!lockingSuccessed) {
            return
        }

        const group = lock.group
        try {
            const rootGroup = await dbapi.getRootGroup()
            let emailsToRemove = group.users
            let results = []
            if (typeof emails !== 'undefined') {
                emailsToRemove = _.without(emails.split(','), '')
            }
            await Promise.all(emailsToRemove?.map((email) =>
                removeGroupUser(email, group, rootGroup).then((result) => {
                    results.push(result)
                })
            ))

            if (!results.length) {
                await apiutil.respond(res, 200, `Unchanged (group ${target})`, {group: {}})
                return
            }
            results = _.without(results, 'not found')
            if (!results.length) {
                await apiutil.respond(res, 404, `Not Found (group ${target})`)
                return
            }
            if (!_.without(results, 'forbidden').length) {
                await apiutil.respond(res, 403, `Forbidden (group ${target})`)
                return
            }

            await dbapi.getGroup(id).then((group) =>
                apiutil.respond(res, 200, `Removed (group ${target})`, {
                    group: apiutil.publishGroup(group)
                })
            )
        }
        catch (err) {
            if (err === 'busy') {
                throw err
            }
        }
    }
    catch (err) {
        apiutil.internalError(res, `Failed to remove group ${target}: `, err.stack)
    }
    finally {
        if (lockingSuccessed) {
            lockutil.unlockGroup(lock)
        }
    }
}

function removeGroupUser(req, res) {
    apiutil.redirectApiWrapper('email', removeGroupUsers, req, res)
}

async function addGroupUsers(req, res) {
    const id = req.params.id
    const emails = apiutil.getBodyParameter(req.body, 'emails')
    const target = apiutil.getQueryParameter(req.query.redirected) ? 'user' : 'users'
    const lock = {}

    const addGroupUser = async(email) => {
        const lock = {}
        try {
            const stats = await dbapi.lockUser(email)
            if (stats.modifiedCount === 0) {
                return apiutil.lightComputeStats(res, stats)
            }

            lock.user = stats.changes[0].new_val
            return dbapi.addGroupUser(id, email)
        }
        catch (err) {
            if (err instanceof TypeError) {
                log.error('User with email ' + email + " doesn't exist")
                return 'User with email ' + email + " doesn't exist"
            }
            else {
                throw Error
            }
        }
        finally {
            lockutil.unlockUser(lock)
        }
    }

    const _addGroupUsers = async(emails) => {
        let results = []
        try {
            await Promise.all(emails?.map((email) =>
                addGroupUser(email).then((result) => {
                    results.push(result)
                })
            ))

            if (!_.without(results, 'unchanged').length) {
                apiutil.respond(res, 200, `Unchanged (group ${target})`, {group: {}})
            }
            else if (!_.without(results, 'not found').length) {
                apiutil.respond(res, 404, `Not Found (group ${target})`)
            }
            else if (_.findIndex(results, str => str.includes("doesn't exist")) !== -1) {
                dbapi.getGroup(id).then((group) =>
                    apiutil.respond(res, 207, `Not all of users added (group ${target})`,
                        {
                            info: results
                            , group: apiutil.publishGroup(group)
                        }
                    )
                )
            }

            const group = await dbapi.getGroup(id)
            apiutil.respond(res, 200, `Added (group ${target})`, {group: apiutil.publishGroup(group)})
        }
        catch (err) {
            if (err !== 'busy') {
                throw err
            }
        }
    }

    let lockingSuccessed
    try {
        lockingSuccessed = await lockutil.lockGroup(req, res, lock)
        if (!lockingSuccessed) {
            return
        }

        const group = lock.group
        if (typeof emails === 'undefined') {
            const users = await dbapi.getUsers()
            const emails = []
            users.forEach((user) => {
                if (group.users.indexOf(user.email) < 0) {
                    emails.push(user.email)
                }
            })
            await _addGroupUsers(emails)
        }
        else {
            await _addGroupUsers(_.difference(_.without(emails.split(','), ''), group.users))
        }
    }
    catch (err) {
        apiutil.internalError(res, `Failed to add group ${target}: `, err.stack)
    }
    finally {
        if (lockingSuccessed) {
            lockutil.unlockGroup(lock)
        }
    }
}

function addGroupUser(req, res) {
    apiutil.redirectApiWrapper('email', addGroupUsers, req, res)
}

async function getGroup(req, res) {
    const id = req.params.id
    const fields = req.query.fields
    try {
        const group = await dbapi.getUserGroup(req.user.email, id)
        if (!group) {
            apiutil.respond(res, 404, 'Not Found (group)')
            return
        }
        let publishedGroup = apiutil.publishGroup(group)
        if (fields) {
            publishedGroup = _.pick(publishedGroup, fields.split(','))
        }
        apiutil.respond(res, 200, 'Group Information', {group: publishedGroup})
    }
    catch (err) {
        apiutil.internalError(res, 'Failed to get group: ', err.stack)
    }
}

async function getGroups(req, res) {
    const fields = req.query.fields
    const owner = req.query.owner
    let getGenericGroups
    switch (owner) {
    case true:
        getGenericGroups = dbapi.getOwnerGroups
        break
    case false:
        getGenericGroups = dbapi.getOnlyUserGroups
        break
    default:
        getGenericGroups = dbapi.getUserGroups
    }
    try {
        const groups = await getGenericGroups(req.user.email)
        apiutil.respond(res, 200, 'Groups Information', {
            groups: groups?.map((group) =>
                fields ? _.pick(apiutil.publishGroup(group), fields.split(',')) : apiutil.publishGroup(group)
            ) || []
        })
    }
    catch (err) {
        apiutil.internalError(res, 'Failed to get groups: ', err.stack)
    }
}

function createGroupFunc(
    res,
    _class,
    email,
    repetitions,
    name,
    username,
    privilege,
    isActive,
    dates,
    start,
    stop,
    duration,
    state,
    runUrl
) {
    checkSchedule(res, null, _class, email, repetitions, privilege,
        start, stop)
        .then(function(checkingSuccessed) {
            if (checkingSuccessed === false) {
                log.info('Schedule check fail')
                return
            }
        })

    return dbapi.createUserGroup({
        name: name
        , owner: {
            email: email
            , name: username
        }
        , privilege: privilege
        , class: _class
        , repetitions: repetitions
        , isActive: isActive
        , dates: dates
        , duration: duration
        , state: state
    })
}

async function createGroup(req, res) {
    const _class = req.body.class || apiutil.ONCE
    const isOrigin = apiutil.isOriginGroup(_class)
    const repetitions = isOrigin || req.body.repetitions || 0
    const now = Date.now()
    const start = isOrigin ?
        new Date(now) :
        new Date(req.body.startTime || now)

    const stop = isOrigin ?
        new Date(now + apiutil.ONE_YEAR) :
        new Date(req.body.stopTime || now + apiutil.ONE_HOUR)

    const email = req.user.email
    const privilege = req.user.privilege
    const username = req.user.name

    const name = req.body.name || 'New_' + util.format('%s', uuidv4()).replace(/-/g, '')
    const state = isOrigin || req.body.state || apiutil.READY

    const isActive = state === apiutil.READY && isOrigin
    const duration = 0
    const dates = apiutil.computeGroupDates({start: start, stop: stop}, _class, repetitions)
    try {
        const group = await createGroupFunc(res, _class, email, repetitions, name, username, privilege, isActive, dates, start, stop, duration, state)
        if (group) {
            apiutil.respond(res, 201, 'Created', {group: apiutil.publishGroup(group)})
        }
        else {
            apiutil.respond(res, 403, 'Forbidden (groups number quota is reached)')
        }
    }
    catch (err) {
        apiutil.internalError(res, 'Failed to create group: ', err.stack)
    }
}

async function deleteGroups(req, res) {
    const ids = apiutil.getBodyParameter(req.body, 'ids')
    const target = apiutil.getQueryParameter(req.query.redirected) ? 'group' : 'groups'
    const removeGroup = async(id) => {
        const unsetDevices = async(serials) => {
            await Promise.all(serials?.map((serial) => {
                const unsetReq = {
                    isInternal: true
                    , serial: serial
                    , user: req.user
                    , params: {email: req.user.email}
                    , options: req.options
                }
                usersapi.deleteUserDeviceBySerial(unsetReq, res)
                usersapi.remoteDisconnectUserDevice(unsetReq, res)
            }))
        }

        const lock = {}
        try {
            const stats = await dbapi.lockGroupByOwner(req.user.email, id)
            log.info('Stats: ' + JSON.stringify(stats))
            if (stats.modifiedCount === 0) {
                return apiutil.lightComputeStats(res, stats)
            }
            lock.group = stats.changes[0].new_val
            const group = lock.group

            if (group.privilege === apiutil.ROOT) {
                return 'forbidden'
            }

            if (group.class === apiutil.BOOKABLE) {
                return await Promise.all(group.devices?.map((serial) =>
                    dbapi.isDeviceBooked(serial).then((isBooked) =>
                        isBooked ? Promise.reject('booked') : true))
                ).then(() =>
                    dbapi.deleteUserGroup(id).then(deleteResult => {
                        unsetDevices(group.devices)
                        return deleteResult
                    })
                ).catch((err) => {
                    if (err !== 'booked') {
                        throw err
                    }
                    return 'forbidden'
                })
            }

            const deleteResult = await dbapi.deleteUserGroup(id)
            await unsetDevices(group.devices)
            return deleteResult
        }
        catch (err) {
            // empty
        }
        finally {
            lockutil.unlockGroup(lock)
        }
    }

    const removeGroups = async(ids) => {
        let results = []
        try {
            await Promise.all(ids?.map((id) =>
                removeGroup(id).then(function(result) {
                    log.info('Remove group result: ' + result)
                    results.push(result)
                })
            ))

            if (!results.length) {
                return apiutil.respond(res, 304, `Unchanged (${target})`)
            }

            results = _.without(results, 'not found')
            if (!results.length) { // if everything is "not found"
                return apiutil.respond(res, 404, `Not Found (${target})`)
            }

            results = _.without(results, 'forbidden')
            if (!results.length) { // if everything is forbidden
                return apiutil.respond(res, 403, `Forbidden (${target})`)
            }

            return apiutil.respond(res, 200, `Deleted (${target})`)
        }
        catch (err) {
            if (err !== 'busy') {
                throw err
            }
        }
    }

    try {
        if (typeof ids === 'undefined') {
            const groups = await dbapi.getOwnerGroups(req.user.email)
            const ids = groups?.flatMap((group) =>
                group.privilege !== apiutil.ROOT ? [group.id] : []
            ) || []

            return await removeGroups(ids)
        }
        else {
            return removeGroups(_.without(ids.split(','), ''))
        }
    }
    catch (err) {
        apiutil.internalError(res, `Failed to delete ${target}: `, err.stack)
    }
}

function deleteGroup(req, res) {
    apiutil.redirectApiWrapper('id', deleteGroups, req, res)
}

async function updateGroup(req, res) {
    const id = req.params.id
    const lock = {}
    const isInternal = req.isInternal

    const updateUserGroup = async(group, data) => {
        const uGroup = await dbapi.updateUserGroup(group, data)
        if (uGroup) {
            if (isInternal) {
                const devices = await dbapi.loadDevicesBySerials(uGroup.devices)
                apiutil.respond(res, 200, 'Updated (group)', {group: {id: uGroup.id, devices: devices}})
            }
            else {
                apiutil.respond(res, 200, 'Updated (group)', {group: apiutil.publishGroup(uGroup)})
            }
        }
        else {
            apiutil.respond(res, 403, 'Forbidden (groups duration quota is reached)')
        }
    }

    let lockingSuccessed
    try {
        lockingSuccessed = await lockutil.lockGroup(req, res, lock)
        if (!lockingSuccessed) {
            return
        }
        const group = lock.group
        const _class = req.body.class || group.class
        const name = req.body.name || group.name
        const repetitions = req.body.repetitions || group.repetitions
        const start = new Date(req.body.startTime || group.dates[0].start)
        const stop = new Date(req.body.stopTime || group.dates[0].stop)
        let state, isActive

        if (group.state !== apiutil.PENDING) {
            // only name can be updated
            state = req.body.state || group.state

            if (start.toISOString() !== group.dates[0].start.toISOString() ||
                stop.toISOString() !== group.dates[0].stop.toISOString() ||
                state !== group.state ||
                _class !== group.class ||
                repetitions !== group.repetitions) {
                apiutil.respond(res, 403, 'Forbidden (only name can be updated)')
                return
            }

            if (name === group.name) {
                apiutil.respond(res, 200, 'Unchanged (group)', {group: {}})
                return
            }
            const updatedGroup = await dbapi.updateGroup(group.id, {
                name: name
            })

            if (updatedGroup) {
                apiutil.respond(res, 200, 'Updated (group)', {group: apiutil.publishGroup(updatedGroup)})
                return
            }
            else {
                throw new Error(`Group not found: ${group.id}`)
            }
        }

        if (apiutil.isOriginGroup(_class)) {
            state = apiutil.READY
            isActive = true
        }
        else {
            state = req.body.state || apiutil.PENDING
            isActive = false
        }

        if (group.state === apiutil.READY && state === apiutil.PENDING) {
            apiutil.respond(res, 403, 'Forbidden (group is ready)')
            return
        }

        const checkingSuccessed = await checkSchedule(res, group, _class, group.owner.email, repetitions, group.privilege, start, stop)
        if(checkingSuccessed === true) {
            if (
                name === group.name &&
                start.toISOString() === group.dates[0].start.toISOString() &&
                stop.toISOString() === group.dates[0].stop.toISOString() &&
                state === group.state &&
                _class === group.class &&
                repetitions === group.repetitions &&
                isInternal
            ) {
                const devices = await dbapi.loadDevicesBySerials(group.devices)
                apiutil.respond(res, 200, 'Unchanged (group)', {group: {id: group.id, devices: devices}})
                return
            }

            const duration = apiutil.isOriginGroup(_class) ?
                0 : group.devices.length * (stop - start) * (repetitions + 1)
            const dates = apiutil.computeGroupDates({start: start, stop: stop}, _class, repetitions)

            if (
                start < group.dates[0].start ||
                stop > group.dates[0].stop ||
                repetitions > group.repetitions ||
                _class !== group.class
            ) {
                const conflicts = checkConflicts(id, group.devices, dates)
                if (!conflicts.length) {
                    await updateUserGroup(group, {
                        name: name
                        , state: state
                        , class: _class
                        , isActive: isActive
                        , repetitions: repetitions
                        , dates: dates
                        , duration: duration
                    })
                    return
                }
                apiutil.respond(res, 409, 'Conflicts Information', {conflicts: conflicts})
                return
            }

            await updateUserGroup(group, {
                name: name
                , state: state
                , class: _class
                , isActive: isActive
                , repetitions: repetitions
                , dates: dates
                , duration: duration
            })
        }
    }
    catch (err) {
        apiutil.internalError(res, 'Failed to update group: %s', err, err.stack)
    }
    finally {
        if (lockingSuccessed) {
            lockutil.unlockGroup(lock)
        }
    }
}

async function getGroupDevices(req, res) {
    const id = req.params.id
    const bookable = req.query.bookable
    try {
        const group = await dbapi.getUserGroup(req.user.email, id)
        if (!group) {
            apiutil.respond(res, 404, 'Not Found (group)')
            return
        }
        if (bookable) {
            if (apiutil.isOriginGroup(group.class)) {
                apiutil.respond(res, 400, 'Bad Request (group is not transient)')
                return
            }
            if (req.user.privilege === apiutil.ADMIN && req.user.email !== group.owner.email) {
                await groupApiWrapper(group.owner.email, getGroupDevices, req, res)
                return
            }
            const devices = await dbapi.loadBookableDevices(req.user.groups.subscribed)
            const serials = devices?.map((device) => device.serial)

            const conflicts = await checkConflicts(group.id, serials, group.dates)

            let bookableSerials = serials
            conflicts.forEach((conflict) => {
                bookableSerials = _.difference(bookableSerials, conflict.devices)
            })

            const deviceList = devices.flatMap((device) =>
                bookableSerials.indexOf(device.serial) > -1 ?
                    [apiutil.filterDevice(req, device)] :
                    []
            )

            apiutil.respond(res, 200, 'Devices Information', {devices: deviceList})
        }
        else {
            const devices = await Promise.all(
                group.devices?.map((serial) => getDevice(req, serial))
            )
            apiutil.respond(res, 200, 'Devices Information', {devices})
        }
    }
    catch (err) {
        apiutil.internalError(res, 'Failed to get group devices: ', err.stack)
    }
}

export {createGroup}
export {createGroupFunc}
export {updateGroup}
export {deleteGroup}
export {deleteGroups}
export {getGroup}
export {getGroups}
export {getGroupUser}
export {getGroupUsers}
export {addGroupUser}
export {addGroupUsers}
export {removeGroupUser}
export {removeGroupUsers}
export {getGroupDevice}
export {getGroupDevices}
export {addGroupDevice}
export {addGroupDevices}
export {removeGroupDevice}
export {removeGroupDevices}
export default {
    createGroup: createGroup
    , createGroupFunc: createGroupFunc
    , updateGroup: updateGroup
    , deleteGroup: deleteGroup
    , deleteGroups: deleteGroups
    , getGroup: getGroup
    , getGroups: getGroups
    , getGroupUser: getGroupUser
    , getGroupUsers: getGroupUsers
    , addGroupUser: addGroupUser
    , addGroupUsers: addGroupUsers
    , removeGroupUser: removeGroupUser
    , removeGroupUsers: removeGroupUsers
    , getGroupDevice: getGroupDevice
    , getGroupDevices: getGroupDevices
    , addGroupDevice: addGroupDevice
    , addGroupDevices: addGroupDevices
    , removeGroupDevice: removeGroupDevice
    , removeGroupDevices: removeGroupDevices
}
