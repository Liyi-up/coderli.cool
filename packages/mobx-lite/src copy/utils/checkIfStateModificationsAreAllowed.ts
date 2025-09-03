import { globalState } from "../core/globalState";

/**
 * 检查是否允许修改状态
 */
function checkIfStateModificationsAreAllowed(): void {
    if (!globalState.allowStateChanges) {
        console.error('State changes are not allowed at this point.');
    }
}

export default checkIfStateModificationsAreAllowed;
