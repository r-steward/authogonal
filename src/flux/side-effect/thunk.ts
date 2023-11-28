import { UserCredentials } from "../../user";
import { AccessManager } from "../access-manager";
import { performLogout, performManualLogin, performSilentLogin, refreshSilentLogin } from "../flux-actions";

type DispatchLike = (action: any) => any;

/**
 * Creates thunk objects to perform access manager actions
 */
export class AuthogonalActionCreator<U> {

    constructor(private accessManager: AccessManager<U>) { }

    public readonly createManualLoginAction = (credentials: UserCredentials) => {
        const am = this.accessManager;
        return async (dispatch: DispatchLike) => {
            dispatch(performManualLogin(credentials));
            return await am.manualLogin(credentials, dispatch);
        }
    }

    public readonly createSilentLoginAction = () => {
        const am = this.accessManager;
        return async (dispatch: DispatchLike) => {
            dispatch(performSilentLogin);
            return await am.silentLogin(dispatch);
        }
    }

    public readonly createRefreshLoginAction = () => {
        const am = this.accessManager;
        return async (dispatch: DispatchLike) => {
            dispatch(refreshSilentLogin);
            return await am.silentLogin(dispatch);
        }
    }

    public readonly createLogoutAction = () => {
        const am = this.accessManager;
        return async (dispatch: DispatchLike) => {
            dispatch(performLogout);
            return await am.logout(dispatch);
        }
    }

    public readonly initializeRefresh = (dispatch: DispatchLike) => {
        const refreshAction = this.createRefreshLoginAction();
        this.accessManager.setRefreshLoginEventCallback(_ => dispatch(refreshAction));
    }
}
