export const signin = () => {
    return {
        type: 'SIGN_IN'
    }
}

export const signout = () => {
    return {
        type: 'SIGN_OUT'
    }
}

export const changeurl = (new_url) => {
    return {
        type: 'CHANGE_URL',
        payload: new_url
    }
}