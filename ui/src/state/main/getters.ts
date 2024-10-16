import { MainInstance } from "./types";

const getters = {

    getUrlsFromUrlString(this: MainInstance): string[] {
        return this.state.videoUrl.split(/[,\s\n]/g)
            .map((url: string) => url.trim())
            .filter((url: string) => Boolean(url.length))
    }

}

export default getters;
