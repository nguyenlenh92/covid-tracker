const URLReducer = (state = "/", action) => {
    switch (action.type){
        case 'CHANGE_URL':
            return action.payload

        default:
            return state
    }
}

export default URLReducer