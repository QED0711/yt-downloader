
import type { GetterMethods, SetterMethods, SpiccatoInstance, SpiccatoExtended } from 'spiccato/types';
import stateSchema from './stateSchema';
import type { DownloadFormat } from '../../types';

// STATE
// export type MainState = typeof stateSchema & {

// };
export type MainState = {
    videoUrl: string,
    analyzing: boolean,
    formats: DownloadFormat[]
}

// GETTERS
type CustomGetters = {
    // place custom getter method type signatures here
    getUrlsFromUrlString: () => string[];
};
export type MainGetters = GetterMethods<MainState, CustomGetters>;

// SETTERS
type CustomSetters = {
    // place custom setter method type signatures here
};
export type MainSetters = SetterMethods<MainState, CustomSetters>;

// METHODS
export type MainMethods = {
    // place custom method type signatures here
};

// NAMESPACE METHODS
/* 
Example:
export type MyCustomNamespace = {
    someNamespacedMethod: (n: number) => void;
}
*/
export type ApiNamespace = {
    getVideoInformation: () => Promise<Record<string, any> | null>;
    download: (format_id: string, audioBook: boolean) => Promise<any>;
}

// EXTENSIONS
export type MainExtensions = {
    api: ApiNamespace
    // place custom namespaces here. Example:
    // myCustomNamespace: MyCustomNamespace;
};

// INSTANCES
type BaseInstance = SpiccatoInstance<MainState, MainGetters, MainSetters, MainMethods>;
export type MainInstance = SpiccatoExtended<BaseInstance, MainExtensions>;
