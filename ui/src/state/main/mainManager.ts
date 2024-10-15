
import Spiccato from 'spiccato';
import type { MainState, MainGetters, MainSetters, MainMethods, MainExtensions, ApiNamespace } from './types'
import stateSchema from './stateSchema'
import getters from './getters'
import setters from './setters'
import methods from './methods'
import api from './api';
import { MODE } from '../../config/environment';


class SpiccatoExtended extends Spiccato<MainState, MainGetters, MainSetters, MainMethods, MainExtensions> {
    /* 
    place 'get' methods here for your custom namespaces. See documentation for details.
    Example: 
    get myCustomNamespace(): MyCustomNamespace {
        return this._myCustomNamespace as MyCustomNamespace
    }
    */
    get api(): ApiNamespace {
        return this._api as ApiNamespace;
    }
}

const mainManager = new SpiccatoExtended(stateSchema, { id: "main" })

// Uncomment below to connect state to localStorage
/*
mainManager.connectToLocalStorage({ 
    persistKey: "main"
})
*/

mainManager.init(); // IMPORTANT: This must be called prior to addCustomGetters and addCustomSetters

mainManager.addCustomGetters(getters)
mainManager.addCustomSetters(setters)
mainManager.addCustomMethods(methods)
mainManager.addNamespacedMethods({api})

export default mainManager;
export const mainPaths = mainManager.paths;

if (MODE === "development") {
    window.managers ??= {};
    window.managers.mainManager = mainManager
}
